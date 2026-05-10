import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Radio, MapPin, Navigation, CheckCircle2, Clock, AlertTriangle, User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import StaffInstallButton from '@/components/pwa/StaffInstallButton';
import GPSPrompt from '@/components/pwa/GPSPrompt';
import { useGPS } from '@/hooks/useGPS';
import { useCustomAuth } from '@/lib/CustomAuthContext';

export default function StaffPortal() {
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const [staff, setStaff] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const { showPrompt, requestLocation, dismissPrompt } = useGPS();

  useEffect(() => {
    if (user?.email) {
      base44.entities.Staff.filter({ email: user.email }).then(list => {
        if (list[0]) { setStaff(list[0]); setIsOnline(list[0].is_online || false); }
      });
    }
  }, [user?.email]);

  const { data: assignments } = useQuery({
    queryKey: ['staff-appointments', user?.email],
    queryFn: () => base44.entities.Appointment.filter({ assigned_staff_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
    initialData: [],
  });

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (staff) {
      const update = { is_online: newStatus };
      if (newStatus) {
        update.online_since = new Date().toISOString();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            base44.entities.Staff.update(staff.id, {
              ...update,
              current_latitude: pos.coords.latitude,
              current_longitude: pos.coords.longitude,
            });
          });
        } else {
          await base44.entities.Staff.update(staff.id, update);
        }
      } else {
        await base44.entities.Staff.update(staff.id, update);
      }
      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    }
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-appointments'] });
      toast.success('Status updated');
    },
  });

  const pending = assignments.filter(a => a.status === 'pending' || a.status === 'accepted');
  const active = assignments.filter(a => a.status === 'in_progress' || a.status === 'arrived');
  const completed = assignments.filter(a => a.status === 'completed');

  const getNextAction = (status) => {
    switch (status) {
      case 'pending': return { label: 'Accept', next: 'accepted', variant: 'default' };
      case 'accepted': return { label: 'Start Navigation', next: 'in_progress', variant: 'default' };
      case 'in_progress': return { label: 'Mark Arrived', next: 'arrived', variant: 'default' };
      case 'arrived': return { label: 'Complete', next: 'completed', variant: 'default' };
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto p-4">
      <GPSPrompt show={showPrompt} onAllow={requestLocation} onDismiss={dismissPrompt} />
      <StaffInstallButton className="mb-4" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Staff Portal</h1>
          <p className="text-xs text-muted-foreground">{user?.full_name || 'Staff'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span>
          <Switch checked={isOnline} onCheckedChange={toggleOnline} />
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse-soft' : 'bg-muted-foreground'}`} />
        </div>
      </div>

      {staff?.verification_status === 'pending' && (
        <Card className="p-4 mb-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium">Your documents are under review</p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-accent">{active.length}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed.length}</p>
          <p className="text-[10px] text-muted-foreground">Completed</p>
        </Card>
      </div>

      {/* Active & Pending tasks */}
      <h3 className="font-semibold text-sm mb-3">Current Tasks</h3>
      {[...active, ...pending].length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm mb-6">
          {isOnline ? 'Waiting for new tasks...' : 'Go online to receive tasks'}
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {[...active, ...pending].map(task => {
            const action = getNextAction(task.status);
            return (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{task.service_title}</h4>
                    <p className="text-xs text-muted-foreground">{task.patient_name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{task.status?.replace('_', ' ')}</Badge>
                </div>
                {task.address && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{task.address}</span>
                  </div>
                )}
                {task.scheduled_date && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(task.scheduled_date), 'MMM d')} • {task.scheduled_time}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1 text-destructive border-destructive/30"
                      onClick={() => updateStatus.mutate({ id: task.id, status: 'declined' })}
                    >
                      Decline
                    </Button>
                  )}
                  {action && (
                    <Button
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => updateStatus.mutate({ id: task.id, status: action.next })}
                    >
                      {action.label}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}