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
import { Plus, Pencil, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';

const CATEGORIES = ['home_nursing', 'doctor_visit', 'lab_test', 'physiotherapy', 'elderly_care', 'post_surgery', 'baby_care', 'cleaning'];

export default function ServiceManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '', price: '', original_price: '', category: 'home_nursing',
    pricing_model: 'one_time', service_type: 'nurse', icon_url: '',
    rating: '4.9', review_count: '', is_new: false, description: '',
  });

  const { data: services } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => base44.entities.Service.list('-sort_order', 100),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const clean = { ...data, price: Number(data.price), original_price: Number(data.original_price) || undefined, rating: Number(data.rating) || undefined };
      return editing
        ? base44.entities.Service.update(editing.id, clean)
        : base44.entities.Service.create(clean);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setOpen(false);
      resetForm();
      toast.success(editing ? 'Service updated' : 'Service created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted');
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, icon_url: file_url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed.');
    }
    setUploading(false);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', price: '', original_price: '', category: 'home_nursing', pricing_model: 'one_time', service_type: 'nurse', icon_url: '', rating: '4.9', review_count: '', is_new: false, description: '' });
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title || '', price: String(s.price || ''), original_price: String(s.original_price || ''),
      category: s.category || 'home_nursing', pricing_model: s.pricing_model || 'one_time',
      service_type: s.service_type || 'nurse', icon_url: s.icon_url || '',
      rating: String(s.rating || '4.9'), review_count: s.review_count || '', is_new: s.is_new || false,
      description: s.description || '',
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Services ({services.length})</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1 rounded-full"><Plus className="w-3.5 h-3.5" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Service</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Price *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div><Label className="text-xs">Original Price</Label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                  </Select></div>
                <div><Label className="text-xs">Pricing Model</Label>
                  <Select value={form.pricing_model} onValueChange={(v) => setForm({ ...form, pricing_model: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select></div>
              </div>
              <div>
                <Label className="text-xs">Service Image</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-14 h-14 rounded-lg border border-input bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.icon_url
                      ? <img src={form.icon_url} alt="" className="w-full h-full object-cover" />
                      : <Upload className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button type="button" variant="outline" size="sm" className="w-full text-xs gap-1" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <><Loader2 className="w-3 h-3 animate-spin" />Uploading...</> : <><Upload className="w-3 h-3" />Upload Image</>}
                    </Button>
                    {form.icon_url && <Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="or paste URL" className="text-xs h-7" />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Rating</Label><Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
                <div><Label className="text-xs">Review Count</Label><Input value={form.review_count} onChange={(e) => setForm({ ...form, review_count: e.target.value })} placeholder="e.g. 3.6k" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
                <Label className="text-xs">Mark as NEW</Label>
              </div>
              <Button className="w-full" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {services.map(s => (
          <Card key={s.id} className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {s.icon_url ? <img src={s.icon_url} alt="" className="w-8 h-8 object-contain" /> : <span className="text-xs font-bold text-primary">{s.title?.[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{s.title}</p>
              <p className="text-xs text-muted-foreground">₹{s.price} • {s.pricing_model?.replace('_', ' ')} • {s.category?.replace(/_/g, ' ')}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}