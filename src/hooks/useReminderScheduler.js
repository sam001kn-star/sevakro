// Runs the reminder engine automatically every hour in the background
import { useEffect, useRef } from 'react';
import { runReminderCheck } from '@/lib/reminderEngine';

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = 'pulsecare_last_reminder_check';

export function useReminderScheduler(enabled = true) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    async function check() {
      try {
        const result = await runReminderCheck();
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        if (result.sent > 0) {
          console.log(`[Reminders] Sent ${result.sent} reminder(s) for ${result.checked} upcoming appointment(s).`);
        }
      } catch (e) {
        console.warn('[Reminders] Check failed:', e.message);
      }
    }

    // Run once on mount (but skip if already ran in last 30 min)
    const lastRun = localStorage.getItem(STORAGE_KEY);
    const msSinceLast = lastRun ? Date.now() - new Date(lastRun).getTime() : Infinity;
    if (msSinceLast > 30 * 60 * 1000) {
      check();
    }

    // Then every hour
    timerRef.current = setInterval(check, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [enabled]);
}