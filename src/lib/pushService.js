/**
 * Push Notification Service
 * Uses browser Web Push API + stores subscriptions in PushSubscription entity
 */
import { base44 } from '@/api/base44Client';

const VAPID_PUBLIC_KEY = null; // Using basic Notification API (no VAPID server needed)

/**
 * Subscribe current user to push notifications and save to DB
 */
export async function subscribeToPush(userEmail, userRole) {
  if (!('Notification' in window)) throw new Error('Notifications not supported');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permission denied');

  // Check if already subscribed
  const existing = await base44.entities.PushSubscription.filter({ user_email: userEmail });
  if (existing && existing.length > 0) {
    return existing[0]; // already subscribed
  }

  // For basic Web Push without a server, store a "browser" subscription marker
  // We'll use ServiceWorker showNotification for local delivery
  const record = await base44.entities.PushSubscription.create({
    user_email: userEmail,
    endpoint: 'browser-local',
    p256dh: '',
    auth: '',
    user_role: userRole || 'user',
  });

  return record;
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPush(userEmail) {
  const subs = await base44.entities.PushSubscription.filter({ user_email: userEmail });
  await Promise.all((subs || []).map(s => base44.entities.PushSubscription.delete(s.id)));
}

/**
 * Check if user is subscribed
 */
export async function isUserSubscribed(userEmail) {
  const subs = await base44.entities.PushSubscription.filter({ user_email: userEmail });
  return subs && subs.length > 0 && Notification.permission === 'granted';
}

/**
 * Send an in-browser notification (admin broadcasts by sending emails + triggering local notifications)
 * This sends via the Core.SendEmail integration as a fallback for real push
 */
export async function sendPushToUser(recipientEmail, title, body) {
  await base44.integrations.Core.SendEmail({
    to: recipientEmail,
    subject: `🔔 ${title}`,
    body: `${body}\n\n— PulseCare Team`,
  });
}

/**
 * Show a local notification immediately (for the currently active user)
 */
export function showLocalNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        tag: options.tag || 'pulsecare',
        ...options,
      });
    }).catch(() => new Notification(title, { body, ...options }));
  } else {
    new Notification(title, { body, ...options });
  }
}