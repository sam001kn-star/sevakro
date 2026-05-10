import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TopBar from '@/components/layout/TopBar';
import HeroSection from '@/components/services/HeroSection';
import ServiceGrid from '@/components/services/ServiceGrid';
import GPSPrompt from '@/components/pwa/GPSPrompt';
import InstallButton from '@/components/pwa/InstallButton';
import { useGPS } from '@/hooks/useGPS';

export default function Home() {
  const navigate = useNavigate();
  const { location, loading: gpsLoading, showPrompt, requestLocation, dismissPrompt } = useGPS();

  const address = {
    locality: gpsLoading ? 'Detecting...' : (location?.label || 'Select Location'),
    full_address: location?.full_address || '',
  };

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }, 'sort_order', 50),
    initialData: [],
  });

  return (
    <div>
      <GPSPrompt show={showPrompt} onAllow={requestLocation} onDismiss={dismissPrompt} />
      <TopBar
        address={address}
        onLocationClick={() => navigate('/location')}
      />
      <div className="px-4 pt-2">
        <InstallButton />
      </div>
      <HeroSection />
      <div id="service-grid" className="px-4 pb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Services we offer</h2>
        <ServiceGrid
          services={services}
          isLoading={isLoading}
          onServiceClick={(service) => navigate(`/book/${service.id}`)}
        />
      </div>
    </div>
  );
}