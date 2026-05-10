import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Dynamically swaps the <link rel="manifest"> based on the current route.
 * Staff portal → manifest-staff.json
 * Doctor portal → manifest-doctor.json
 * Everything else → manifest.json
 */
export function useRoleManifest() {
  const location = useLocation();

  useEffect(() => {
    let manifestHref = '/manifest.json';

    if (location.pathname === '/staff-portal') {
      manifestHref = '/manifest-staff.json';
    } else if (location.pathname === '/doctor-portal') {
      manifestHref = '/manifest-doctor.json';
    }

    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }

    if (link.href !== manifestHref) {
      link.href = manifestHref;
    }
  }, [location.pathname]);
}