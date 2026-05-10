import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isSupported] = useState(() => 'Notification' in window);

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          icon: 'https://placehold.co/192x192/800000/ffffff?text=PC',
          badge: 'https://placehold.co/72x72/800000/ffffff?text=PC',
          vibrate: [200, 100, 200],
          ...options,
        });
      }).catch(() => {
        new Notification(title, {
          icon: 'https://placehold.co/192x192/800000/ffffff?text=PC',
          ...options,
        });
      });
    } else {
      new Notification(title, options);
    }
  };

  return { permission, isSupported, requestPermission, showNotification };
}