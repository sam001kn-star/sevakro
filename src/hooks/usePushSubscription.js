import { useState, useEffect, useCallback } from 'react';
import { subscribeToPush, unsubscribeFromPush, isUserSubscribed } from '@/lib/pushService';

export function usePushSubscription(userEmail, userRole) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (!userEmail || !('Notification' in window)) return;
    setPermission(Notification.permission);
    isUserSubscribed(userEmail).then(setSubscribed).catch(() => {});
  }, [userEmail]);

  const subscribe = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      await subscribeToPush(userEmail, userRole);
      setSubscribed(true);
      setPermission(Notification.permission);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userRole]);

  const unsubscribe = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      await unsubscribeFromPush(userEmail);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  return { subscribed, loading, permission, subscribe, unsubscribe };
}