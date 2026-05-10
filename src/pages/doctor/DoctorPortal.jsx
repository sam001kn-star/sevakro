import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DoctorInstallButton from '@/components/pwa/DoctorInstallButton';
import GPSPrompt from '@/components/pwa/GPSPrompt';
import { useGPS } from '@/hooks/useGPS';
import { useCustomAuth } from '@/lib/CustomAuthContext';

export default function DoctorPortal() {
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const { showPrompt, requestLocation, dismissPrompt } = useGPS();

  const { data: appointments } = useQuery({
    queryKey: ['doctor-appointments', user?.email],
    queryFn: () => base44.entities.Appointment.filter({ assigned_doctor_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success('Updated');
    },
  });

  const pending = appointments.filter(a => a.status === 'pending');
  const accepted = appointments.filter(a => a.status === 'accepted');
  const completed = appointments.filter(a => a.status === 'completed');
  const today = appointments.filter(a => a.scheduled_date === format(new Date(), 'yyyy-MM-dd'));

  const [tokenInput, setTokenInput] = useState({});

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto p-4">
      <GPSPrompt show={showPrompt} onAllow={requestLocation} onDismiss={dismissPrompt} />
      <DoctorInstallButton className="mb-4" />
      <h1 className="text-xl font-bold mb-1">Doctor Portal</h1>
      <p className="text-xs text-muted-foreground mb-6">Dr. {user?.full_name || 'Doctor'}</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{today.length}</p>
          <p className="text-[9px] text-muted-foreground">Today</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-accent">{pending.length}</p>
          <p className="text-[9px] text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{accepted.length}</p>
          <p className="text-[9px] text-muted-foreground">Accepted</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{completed.length}</p>
          <p className="text-[9px] text-muted-foreground">Done</p>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full bg-muted mb-4">
          <TabsTrigger value="pending" className="flex-1 text-xs">Requests ({pending.length})</TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1 text-xs">Scheduled ({accepted.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-xs">Done</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">No pending requests</div>
          ) : (
            <div className="space-y-3">
              {pending.map(apt => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{apt.patient_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{apt.service_title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.scheduled_date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.scheduled_time}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline"
                      className="flex-1 text-xs text-destructive border-destructive/30 gap-1"
                      onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'declined' } })}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'accepted' } })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted">
          {accepted.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">No scheduled appointments</div>
          ) : (
            <div className="space-y-3">
              {accepted.map(apt => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{apt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.service_title}</p>
                    </div>
                    {apt.token_number && (
                      <Badge className="bg-primary text-primary-foreground text-xs">Token #{apt.token_number}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>{apt.scheduled_date} • {apt.scheduled_time}</span>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label className="text-[10px]">Assign Token #</Label>
                      <Input
                        type="number"
                        placeholder="Token"
                        className="h-8 text-xs"
                        value={tokenInput[apt.id] || ''}
                        onChange={(e) => setTokenInput({ ...tokenInput, [apt.id]: e.target.value })}
                      />
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-8"
                      onClick={() => {
                        if (tokenInput[apt.id]) {
                          updateMutation.mutate({ id: apt.id, data: { token_number: Number(tokenInput[apt.id]) } });
                        }
                      }}>
                      Set
                    </Button>
                    <Button size="sm" className="text-xs h-8"
                      onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'completed' } })}>
                      Complete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">No completed appointments</div>
          ) : (
            <div className="space-y-3">
              {completed.map(apt => (
                <Card key={apt.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{apt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">{apt.service_title} • {apt.scheduled_date}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-[10px]">Completed</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}