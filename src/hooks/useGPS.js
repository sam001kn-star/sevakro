import { useState, useEffect, useCallback } from 'react';

const LOCATION_KEY = 'pulsecare_location';

export function useGPS() {
  const [location, setLocation] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCATION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Auto-show prompt if no cached location
  useEffect(() => {
    if (!location) {
      const timer = setTimeout(() => setShowPrompt(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setShowPrompt(false);
      return;
    }
    setLoading(true);
    setShowPrompt(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: Date.now(),
        };
        setLocation(loc);
        setLoading(false);
        try { localStorage.setItem(LOCATION_KEY, JSON.stringify(loc)); } catch {}

        // Reverse geocode (simple approximation via open API)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`)
          .then(r => r.json())
          .then(data => {
            const address = data.address || {};
            const label = address.suburb || address.neighbourhood || address.city_district || address.city || 'Your Location';
            const full = data.display_name || '';
            const enriched = { ...loc, label, full_address: full };
            setLocation(enriched);
            try { localStorage.setItem(LOCATION_KEY, JSON.stringify(enriched)); } catch {}
          })
          .catch(() => {});
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        setShowPrompt(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const dismissPrompt = useCallback(() => setShowPrompt(false), []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    try { localStorage.removeItem(LOCATION_KEY); } catch {}
    setShowPrompt(true);
  }, []);

  return { location, loading, error, showPrompt, requestLocation, dismissPrompt, clearLocation };
}