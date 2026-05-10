import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function StaffTracking() {
  const { data: staffList } = useQuery({
    queryKey: ['admin-staff-tracking'],
    queryFn: () => base44.entities.Staff.filter({ verification_status: 'approved' }),
    initialData: [],
    refetchInterval: 30000, // refresh every 30s
  });

  const online = staffList.filter(s => s.is_online);
  const offline = staffList.filter(s => !s.is_online);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{online.length}</p>
          <p className="text-xs text-muted-foreground">Online Now</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{offline.length}</p>
          <p className="text-xs text-muted-foreground">Offline</p>
        </Card>
      </div>

      <h3 className="font-semibold text-sm mb-3">Online Staff</h3>
      {online.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground mb-6">No staff currently online</Card>
      ) : (
        <div className="space-y-2 mb-6">
          {online.map(s => (
            <Card key={s.id} className="p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              <div className="flex-1">
                <p className="font-medium text-sm">{s.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {s.online_since && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      Online {formatDistanceToNow(new Date(s.online_since))}
                    </span>
                  )}
                  {s.current_latitude && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {s.current_latitude.toFixed(2)}, {s.current_longitude?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <Badge className="text-[10px]">{s.total_jobs_completed || 0} jobs</Badge>
            </Card>
          ))}
        </div>
      )}

      <h3 className="font-semibold text-sm mb-3">All Staff</h3>
      <div className="space-y-2">
        {staffList.map(s => (
          <Card key={s.id} className="p-3 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${s.is_online ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
            <div className="flex-1">
              <p className="font-medium text-sm">{s.full_name}</p>
              <p className="text-xs text-muted-foreground">{s.specialization || 'Nurse'} • ★ {s.rating || 5.0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">{s.total_jobs_completed || 0}</p>
              <p className="text-[9px] text-muted-foreground">completed</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}