import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Plus, Navigation, MapPin } from 'lucide-react';

export default function LocationSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // In a real app, reverse geocode this
          navigate('/', { state: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        },
        () => alert('Could not get your location. Please enable location access.')
      );
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Search your location</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search locality, sector, area"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-card rounded-xl border-border"
          />
        </div>
      </div>

      {/* Options */}
      <div className="bg-card mx-4 rounded-xl border border-border divide-y divide-border">
        <button className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/50 transition-colors">
          <Plus className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Add address</span>
          <div className="ml-auto">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
        <button
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-muted/50 transition-colors"
        >
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Use current location</span>
          <div className="ml-auto">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      {/* Saved Addresses */}
      <div className="px-4 mt-6">
        <p className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mb-3">
          Saved Addresses
        </p>
        <div className="text-center py-8 text-sm text-muted-foreground">
          No saved addresses yet
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}