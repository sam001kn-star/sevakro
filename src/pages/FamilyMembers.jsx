import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/lib/CustomAuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FamilyMembers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const userEmail = user?.email;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relation: 'spouse', age: '', gender: 'male', phone: '' });

  const { data: members } = useQuery({
    queryKey: ['family', userEmail],
    queryFn: () => base44.entities.FamilyMember.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family'] });
      setOpen(false);
      setForm({ name: '', relation: 'spouse', age: '', gender: 'male', phone: '' });
      toast.success('Family member added!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family'] }),
  });

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center justify-between px-4 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold">Family Members</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-xs">Relation</Label>
                <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['spouse', 'parent', 'child', 'sibling', 'other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label className="text-xs">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['male', 'female', 'other'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <Button className="w-full" onClick={() => {
                if (!form.name) { toast.error('Name is required'); return; }
                addMutation.mutate({ ...form, age: Number(form.age) || undefined, user_email: userEmail });
              }} disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 py-4">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No family members added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <Card key={m.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {m.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.relation} {m.age ? `• ${m.age} yrs` : ''}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(m.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}