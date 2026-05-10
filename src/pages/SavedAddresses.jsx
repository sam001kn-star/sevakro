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
import { ArrowLeft, Plus, MapPin, Trash2, Home, Briefcase, LocateFixed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedAddresses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const userEmail = user?.email;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_address: '', locality: '', city: '', pincode: '', label: 'home' });
  const [locating, setLocating] = useState(false);

  const autoPickLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          const full = data.display_name || '';
          const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || '';
          const city = addr.city || addr.county || addr.state_district || '';
          const pincode = addr.postcode || '';
          setForm(f => ({ ...f, full_address: full, locality, city, pincode }));
          toast.success('Location picked!');
        } catch {
          toast.error('Could not fetch address. Please enter manually.');
        }
        setLocating(false);
      },
      () => { toast.error('Location access denied.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const { data: addresses } = useQuery({
    queryKey: ['addresses', userEmail],
    queryFn: () => base44.entities.Address.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Address.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setOpen(false);
      toast.success('Address saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Address.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const labelIcon = (label) => {
    if (label === 'home') return <Home className="w-4 h-4" />;
    if (label === 'work') return <Briefcase className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center justify-between px-4 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-semibold">Saved Addresses</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full text-xs gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Address</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={autoPickLocation}
                disabled={locating}
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4 text-primary" />}
                {locating ? 'Detecting location...' : 'Use my current location'}
              </Button>
              <div><Label className="text-xs">Label</Label>
                <Select value={form.label} onValueChange={(v) => setForm({ ...form, label: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label className="text-xs">Full Address *</Label><Input value={form.full_address} onChange={(e) => setForm({ ...form, full_address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Locality</Label><Input value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} /></div>
                <div><Label className="text-xs">City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Pincode</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
              <Button className="w-full" onClick={() => {
                if (!form.full_address) { toast.error('Address is required'); return; }
                addMutation.mutate({ ...form, user_email: userEmail });
              }} disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 py-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No saved addresses yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map(a => (
              <Card key={a.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {labelIcon(a.label)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize">{a.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.full_address}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive h-7 w-7"
                  onClick={() => deleteMutation.mutate(a.id)}>
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