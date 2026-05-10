import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, CheckCircle, Loader2, RefreshCw, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isToday } from 'date-fns';
import { runReminderCheck } from '@/lib/reminderEngine';

function getAppointmentDateTime(appt) {
  try {
    const d = parseISO(appt.scheduled_date);
    const [time, meridiem] = (appt.scheduled_time || '12:00 PM').split(' ');
    let [h, m] = time.split(':').map(Number);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    d.setHours(h, m, 0, 0);
    return d;
  } catch { return null; }
}

async function sendReminderEmail(appt, recipientEmail, recipientName, role) {
  const dateStr = appt.scheduled_date ? format(parseISO(appt.scheduled_date), 'EEEE, MMMM do yyyy') : '';
  const timeStr = appt.scheduled_time || '';
  const subject = role === 'patient'
    ? `⏰ Reminder: Your appointment in 1 hour – ${appt.service_title}`
    : `⏰ Upcoming appointment in 1 hour – ${appt.patient_name || 'Patient'}`;
  const body = role === 'patient'
    ? `Hello ${recipientName},\n\nYour appointment for "${appt.service_title}" is in approximately 1 hour.\n\n📅 ${dateStr}\n⏰ ${timeStr}\n📍 ${appt.address || 'As provided'}\n\nPlease be ready 10 minutes early.\n\n— PulseCare Team`
    : `Hello ${recipientName},\n\nReminder: Upcoming appointment in ~1 hour.\n\n🏥 ${appt.service_title}\n👤 ${appt.patient_name || 'N/A'}\n⏰ ${timeStr}\n📅 ${dateStr}\n📍 ${appt.address || 'N/A'}\n\n— PulseCare Admin`;
  await base44.integrations.Core.SendEmail({ to: recipientEmail, subject, body });
}

export default function AppointmentReminders() {
  const [sending, setSending] = useState({});
  const [manualSent, setManualSent] = useState([]);
  const [running, setRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-reminders'],
    queryFn: () => base44.entities.Appointment.filter({ status: 'accepted' }, 'scheduled_date', 100),
  });

  const { data: reminderLogs = [] } = useQuery({
    queryKey: ['reminder-logs'],
    queryFn: () => base44.entities.ReminderLog.list('-sent_at', 50),
    refetchInterval: 30000,
  });

  const upcomingAppts = appointments.filter(appt => {
    const dt = getAppointmentDateTime(appt);
    if (!dt) return false;
    const diffMs = dt - new Date();
    return diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000;
  });

  const todayAppts = appointments.filter(appt => {
    try { return isToday(parseISO(appt.scheduled_date)); } catch { return false; }
  });

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const result = await runReminderCheck();
      setLastRunResult(result);
      if (result.sent > 0) {
        toast.success(`✅ Sent ${result.sent} reminder email(s) for ${result.checked} appointment(s)`);
      } else if (result.checked > 0) {
        toast.info(`All reminders already sent for ${result.checked} upcoming appointment(s)`);
      } else {
        toast.info('No appointments in the 45–75 minute window right now');
      }
      refetch();
    } catch (e) {
      toast.error('Reminder run failed: ' + e.message);
    }
    setRunning(false);
  };

  const handleSendManual = async (appt) => {
    setSending(s => ({ ...s, [appt.id]: true }));
    const tasks = [];
    if (appt.user_email) tasks.push(sendReminderEmail(appt, appt.user_email, appt.patient_name || 'Patient', 'patient'));
    if (appt.assigned_staff_email) tasks.push(sendReminderEmail(appt, appt.assigned_staff_email, appt.assigned_staff_name || 'Staff', 'staff'));
    if (appt.assigned_doctor_email) tasks.push(sendReminderEmail(appt, appt.assigned_doctor_email, appt.assigned_doctor_name || 'Doctor', 'doctor'));
    await Promise.all(tasks);
    setManualSent(l => [...l, appt.id]);
    toast.success(`Reminders sent for ${appt.patient_name || appt.service_title}`);
    setSending(s => ({ ...s, [appt.id]: false }));
  };

  const lastRun = localStorage.getItem('pulsecare_last_reminder_check');

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold">Auto-Scheduler Active</span>
          </div>
          <Button size="sm" onClick={handleRunNow} disabled={running} className="gap-1.5">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Run Now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Automatically checks every hour and sends email reminders to patients, staff, and doctors for appointments 45–75 minutes away. Deduplicates so reminders are only sent once per appointment.
        </p>
        {lastRun && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last checked: {format(new Date(lastRun), 'MMM d, h:mm a')}
          </p>
        )}
        {lastRunResult && (
          <p className="text-xs font-medium text-primary">
            Last run: {lastRunResult.sent} sent, {lastRunResult.checked} appointments checked
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {upcomingAppts.length} in next 2h · {todayAppts.length} today
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {upcomingAppts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">⏰ Within Next 2 Hours</h3>
          <div className="space-y-2">
            {upcomingAppts.map(appt => (
              <ReminderCard key={appt.id} appt={appt} sent={manualSent.includes(appt.id)} loading={sending[appt.id]} onSend={() => handleSendManual(appt)} highlight />
            ))}
          </div>
        </div>
      )}

      {todayAppts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Today's Appointments</h3>
          <div className="space-y-2">
            {todayAppts.map(appt => (
              <ReminderCard key={appt.id} appt={appt} sent={manualSent.includes(appt.id)} loading={sending[appt.id]} onSend={() => handleSendManual(appt)} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && todayAppts.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">No accepted appointments today.</div>
      )}

      {/* Recent reminder log */}
      {reminderLogs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Reminder Log</h3>
          <div className="space-y-1.5">
            {reminderLogs.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs bg-card border rounded-lg px-3 py-2">
                <span className="text-muted-foreground truncate">{log.recipient_email}</span>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {log.sent_at ? format(new Date(log.sent_at), 'MMM d, h:mm a') : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderCard({ appt, sent, loading, onSend, highlight }) {
  const dt = getAppointmentDateTime(appt);
  const diffMin = dt ? Math.round((dt - new Date()) / 60000) : null;
  return (
    <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${highlight ? 'border-primary/30 bg-primary/5' : 'bg-card'}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{appt.service_title}</p>
        <p className="text-xs text-muted-foreground truncate">{appt.patient_name} · {appt.scheduled_time}</p>
        <div className="flex gap-1.5 flex-wrap mt-1">
          {appt.user_email && <Badge variant="outline" className="text-[10px] py-0">Patient</Badge>}
          {appt.assigned_staff_email && <Badge variant="outline" className="text-[10px] py-0">Staff</Badge>}
          {appt.assigned_doctor_email && <Badge variant="outline" className="text-[10px] py-0">Doctor</Badge>}
          {diffMin !== null && diffMin >= 0 && (
            <Badge className="text-[10px] py-0 bg-amber-100 text-amber-800 border-0">
              {diffMin < 60 ? `${diffMin}m` : `${Math.round(diffMin / 60)}h`} away
            </Badge>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {sent ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Sent
          </span>
        ) : (
          <Button size="sm" variant="outline" onClick={onSend} disabled={loading} className="text-xs gap-1">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Remind
          </Button>
        )}
      </div>
    </div>
  );
}