import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

const notificationSettings = [
  { id: 'booking_updates', label: 'Booking Updates', desc: 'Status changes for your appointments' },
  { id: 'staff_assigned', label: 'Staff Assigned', desc: 'When a nurse or doctor is assigned to you' },
  { id: 'reminders', label: 'Appointment Reminders', desc: '1 hour and 1 day before your appointment' },
  { id: 'promos', label: 'Promotions & Offers', desc: 'Discount codes and special offers' },
  { id: 'referral', label: 'Referral Rewards', desc: 'When someone uses your referral code' },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(
    Object.fromEntries(notificationSettings.map(s => [s.id, true]))
  );

  const toggle = (id) => setEnabled(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Notifications</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="text-xs text-muted-foreground mb-2">Manage what notifications you receive from PulseCare.</p>
        <Card className="divide-y divide-border">
          {notificationSettings.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${enabled[s.id] ? 'bg-primary/10' : 'bg-muted'}`}>
                {enabled[s.id]
                  ? <Bell className="w-4 h-4 text-primary" />
                  : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <button
                onClick={() => toggle(s.id)}
                className={`w-11 h-6 rounded-full transition-colors relative ${enabled[s.id] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled[s.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}