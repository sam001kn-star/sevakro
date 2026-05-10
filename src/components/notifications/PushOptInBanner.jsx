import { useState, useEffect } from 'react';
import { Bell, X, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { toast } from 'sonner';

const DISMISSED_KEY = 'pulsecare_push_dismissed';

export default function PushOptInBanner({ user }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const { subscribed, loading, permission, subscribe } = usePushSubscription(user?.email, user?.role);

  // Don't show if already subscribed, dismissed, or permission not in 'default' state
  if (dismissed || subscribed || permission === 'granted' || permission === 'denied' || permission === 'unsupported') {
    return null;
  }

  const handleSubscribe = async () => {
    try {
      await subscribe();
      toast.success('🔔 Notifications enabled! You\'ll now receive updates from PulseCare.');
    } catch (e) {
      toast.error(e.message || 'Could not enable notifications.');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-primary text-primary-foreground rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Stay updated</p>
          <p className="text-xs opacity-80 mt-0.5 leading-snug">
            Get notified about your appointments, reminders, and important updates.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 text-xs h-8 px-3"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity px-2"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}