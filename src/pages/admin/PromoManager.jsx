import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoManager() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '',
    max_discount: '', max_uses: '', is_active: true,
  });

  const { data: promos } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => base44.entities.PromoCode.list('-created_date', 100),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PromoCode.create({
      ...data,
      discount_value: Number(data.discount_value),
      min_order_amount: Number(data.min_order_amount) || 0,
      max_discount: Number(data.max_discount) || undefined,
      max_uses: Number(data.max_uses) || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      setOpen(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', max_uses: '', is_active: true });
      toast.success('Promo code created');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.PromoCode.update(id, { is_active: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-promos'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast.success('Promo deleted');
    },
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PULSE';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Promo Codes ({promos.length})</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1 rounded-full"><Plus className="w-3.5 h-3.5" /> Create Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Code</Label>
                <div className="flex gap-2">
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="PULSECARE20" />
                  <Button variant="outline" size="sm" onClick={generateCode} className="text-xs shrink-0">Generate</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Discount Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select></div>
                <div><Label className="text-xs">Discount Value *</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Min Order ₹</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></div>
                <div><Label className="text-xs">Max Discount ₹</Label><Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Max Uses</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
              <Button className="w-full" onClick={() => {
                if (!form.code || !form.discount_value) { toast.error('Code and discount value are required'); return; }
                createMutation.mutate(form);
              }} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Promo Code'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {promos.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">No promo codes yet</Card>
      ) : (
        <div className="space-y-2">
          {promos.map(p => (
            <Card key={p.id} className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-bold text-sm">{p.code}</p>
                <p className="text-xs text-muted-foreground">
                  {p.discount_type === 'percentage' ? `${p.discount_value}% off` : `₹${p.discount_value} off`}
                  {p.max_uses ? ` • ${p.used_count || 0}/${p.max_uses} used` : ''}
                </p>
              </div>
              <Switch
                checked={p.is_active}
                onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, active: v })}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                onClick={() => deleteMutation.mutate(p.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}