// reminderEngine.js — runs automatically on a schedule, deduplicates via ReminderLog entity
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';

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

async function isAlreadySent(appointmentId, recipientEmail) {
  try {
    const logs = await base44.entities.ReminderLog.filter({
      appointment_id: appointmentId,
      recipient_email: recipientEmail,
      reminder_type: '1hour',
    });
    return logs && logs.length > 0;
  } catch { return false; }
}

async function markSent(appointmentId, recipientEmail) {
  await base44.entities.ReminderLog.create({
    appointment_id: appointmentId,
    recipient_email: recipientEmail,
    reminder_type: '1hour',
    sent_at: new Date().toISOString(),
  });
}

async function sendReminderEmail(appt, recipientEmail, recipientName, role) {
  const dateStr = appt.scheduled_date
    ? format(parseISO(appt.scheduled_date), 'EEEE, MMMM do yyyy')
    : '';
  const timeStr = appt.scheduled_time || '';

  const subject = role === 'patient'
    ? `⏰ Reminder: Your appointment in 1 hour – ${appt.service_title}`
    : `⏰ Upcoming appointment in 1 hour – ${appt.patient_name || 'Patient'}`;

  const body = role === 'patient'
    ? `Hello ${recipientName},\n\nThis is an automated reminder that your appointment for "${appt.service_title}" is in approximately 1 hour.\n\n📅 Date: ${dateStr}\n⏰ Time: ${timeStr}\n📍 Address: ${appt.address || 'As provided'}\n\nPlease be ready 10 minutes early. Contact us immediately if you need to reschedule.\n\n— PulseCare Team`
    : `Hello ${recipientName},\n\nAutomated reminder: You have an upcoming appointment in approximately 1 hour.\n\n🏥 Service: ${appt.service_title}\n👤 Patient: ${appt.patient_name || 'N/A'}\n📞 Phone: ${appt.patient_phone || 'N/A'}\n⏰ Time: ${timeStr}\n📅 Date: ${dateStr}\n📍 Address: ${appt.address || 'N/A'}\n📝 Notes: ${appt.notes || 'None'}\n\nPlease be on time.\n\n— PulseCare Admin`;

  await base44.integrations.Core.SendEmail({ to: recipientEmail, subject, body });
}

export async function runReminderCheck() {
  const now = new Date();

  // Fetch accepted appointments
  const appointments = await base44.entities.Appointment.filter({ status: 'accepted' }, 'scheduled_date', 200);

  // Filter: appointment is 45–75 minutes from now (1-hour window ±15 min tolerance)
  const dueSoon = appointments.filter(appt => {
    const dt = getAppointmentDateTime(appt);
    if (!dt) return false;
    const diffMin = (dt - now) / 60000;
    return diffMin >= 45 && diffMin <= 75;
  });

  let sent = 0;

  for (const appt of dueSoon) {
    const recipients = [
      appt.user_email && { email: appt.user_email, name: appt.patient_name || 'Patient', role: 'patient' },
      appt.assigned_staff_email && { email: appt.assigned_staff_email, name: appt.assigned_staff_name || 'Staff', role: 'staff' },
      appt.assigned_doctor_email && { email: appt.assigned_doctor_email, name: appt.assigned_doctor_name || 'Doctor', role: 'doctor' },
    ].filter(Boolean);

    for (const r of recipients) {
      const alreadySent = await isAlreadySent(appt.id, r.email);
      if (!alreadySent) {
        await sendReminderEmail(appt, r.email, r.name, r.role);
        await markSent(appt.id, r.email);
        sent++;
      }
    }
  }

  return { checked: dueSoon.length, sent };
}