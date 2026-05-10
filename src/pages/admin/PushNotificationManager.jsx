import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sendPushToUser } from '@/lib/pushService';

export default function PushNotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(null);
  const [targetRole, setTargetRole] = useState('all');

  const { data: subscriptions = [], isLoading, refetch } = useQuery({
    queryKey: ['push-subscriptions'],
    queryFn: () => base44.entities.PushSubscription.list('-created_date', 200),
  });

  const roleOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'user', label: 'Patients Only' },
    { value: 'staff', label: 'Staff Only' },
    { value: 'doctor', label: 'Doctors Only' },
  ];

  const filtered = targetRole === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.user_role === targetRole);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both a title and message.');
      return;
    }
    if (filtered.length === 0) {
      toast.error('No subscribed users found for the selected audience.');
      return;
    }
    setSending(true);
    setSentCount(null);
    let count = 0;
    // Send in batches to avoid overwhelming the API
    for (const sub of filtered) {
      try {
        await sendPushToUser(sub.user_email, title, message);
        count++;
      } catch (e) {
        console.error('Failed to notify:', sub.user_email, e);
      }
    }
    setSentCount(count);
    setSending(false);
    toast.success(`Notification sent to ${count} subscriber(s)!`);
    setTitle('');
    setMessage('');
  };

  const roleCounts = {
    user: subscriptions.filter(s => s.user_role === 'user').length,
    staff: subscriptions.filter(s => s.user_role === 'staff').length,
    doctor: subscriptions.filter(s => s.user_role === 'doctor').length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Patients', count: roleCounts.user, color: 'bg-blue-50 text-blue-700' },
          { label: 'Staff', count: roleCounts.staff, color: 'bg-green-50 text-green-700' },
          { label: 'Doctors', count: roleCounts.doctor, color: 'bg-purple-50 text-purple-700' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl p-3 text-center ${item.color}`}>
            <p className="text-2xl font-bold">{item.count}</p>
            <p className="text-xs font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Total subscribers */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{subscriptions.length} total subscribers</span>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>

      {/* Compose */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Compose Notification</p>
        </div>

        {/* Audience selector */}
        <div className="flex gap-2 flex-wrap">
          {roleOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTargetRole(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                targetRole === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {opt.label}
              {opt.value !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({opt.value === 'user' ? roleCounts.user : opt.value === 'staff' ? roleCounts.staff : roleCounts.doctor})
                </span>
              )}
            </button>
          ))}
        </div>

        <Input
          placeholder="Notification title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
        />
        <Textarea
          placeholder="Message body..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          maxLength={300}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Will notify {filtered.length} subscriber(s)
          </p>
          <Button onClick={handleBroadcast} disabled={sending || !title.trim() || !message.trim()} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </div>

      {sentCount !== null && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4" />
          Last broadcast: {sentCount} notification(s) sent successfully.
        </div>
      )}

      {/* Subscriber list */}
      {subscriptions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Subscribers</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between text-xs bg-card border rounded-lg px-3 py-2">
                <span className="text-muted-foreground truncate">{sub.user_email}</span>
                <Badge variant="outline" className="text-[10px] capitalize shrink-0 ml-2">{sub.user_role}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}