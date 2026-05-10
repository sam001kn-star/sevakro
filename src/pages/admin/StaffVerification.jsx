import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffVerification() {
  const queryClient = useQueryClient();

  const { data: staffList, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => base44.entities.Staff.list('-created_date', 100),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Staff.update(id, { verification_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Staff status updated');
    },
  });

  const pending = staffList.filter(s => s.verification_status === 'pending');
  const approved = staffList.filter(s => s.verification_status === 'approved');

  return (
    <div>
      <h3 className="font-semibold text-sm mb-3">Pending Verification ({pending.length})</h3>
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Loading...</div>
      ) : pending.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground mb-6">No pending verifications</Card>
      ) : (
        <div className="space-y-3 mb-6">
          {pending.map(s => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                  {s.specialization && <p className="text-xs text-muted-foreground">{s.specialization}</p>}
                </div>
                <Badge variant="outline" className="text-accent border-accent/30 text-[10px]">
                  <Clock className="w-3 h-3 mr-1" /> Pending
                </Badge>
              </div>
              {s.document_urls?.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {s.document_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary underline flex items-center gap-0.5">
                      <FileText className="w-3 h-3" /> Doc {i + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs text-destructive border-destructive/30 gap-1"
                  onClick={() => updateMutation.mutate({ id: s.id, status: 'rejected' })}>
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
                <Button size="sm" className="flex-1 text-xs gap-1"
                  onClick={() => updateMutation.mutate({ id: s.id, status: 'approved' })}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <h3 className="font-semibold text-sm mb-3">Approved Staff ({approved.length})</h3>
      <div className="space-y-2">
        {approved.map(s => (
          <Card key={s.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.full_name}</p>
              <p className="text-xs text-muted-foreground">{s.specialization || 'Nurse'} • {s.total_jobs_completed || 0} jobs</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Approved</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}