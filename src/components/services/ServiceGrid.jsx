import ServiceCard from './ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServiceGrid({ services, isLoading, onServiceClick }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-3">
            <Skeleton className="w-full aspect-square rounded-lg mb-2" />
            <Skeleton className="h-3 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {services?.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onClick={onServiceClick}
        />
      ))}
    </div>
  );
}