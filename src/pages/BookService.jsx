import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCustomAuth } from '@/lib/CustomAuthContext';

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCustomAuth();
  const [date, setDate] = useState(null);
  const [form, setForm] = useState({
    scheduled_time: '',
    patient_name: user?.full_name || '',
    patient_phone: user?.phone || '',
    address: '',
    notes: '',
    booking_type: 'one_time',
    payment_method: 'cod',
  });

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const list = await base44.entities.Service.list('-created_date', 200);
      return list.find(s => s.id === serviceId) || null;
    },
    enabled: !!serviceId,
  });

  const bookMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Booking confirmed!');
      navigate('/bookings');
    },
  });

  const handleBook = () => {
    if (!date || !form.scheduled_time || !form.patient_name || !form.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    bookMutation.mutate({
      user_email: user?.email,
      service_id: serviceId,
      service_title: service?.title,
      appointment_type: service?.service_type || 'nurse',
      booking_type: form.booking_type,
      scheduled_date: format(date, 'yyyy-MM-dd'),
      scheduled_time: form.scheduled_time,
      patient_name: form.patient_name,
      patient_phone: form.patient_phone,
      address: form.address,
      amount: service?.price,
      notes: form.notes,
      status: 'pending',
      payment_status: 'pending',
      payment_method: form.payment_method,
    });
  };

  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">Book Service</h1>
      </div>

      {serviceLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {service && (
        <div className="px-4 py-4">
          <Card className="p-4 mb-4 bg-primary/5 border-primary/10">
            <h2 className="font-bold text-base">{service.title}</h2>
            <p className="text-sm text-muted-foreground">{service.description}</p>
            <p className="text-xl font-bold mt-2">
              ₹{service.price}
              {service.original_price > service.price && (
                <span className="text-sm text-muted-foreground line-through ml-2">₹{service.original_price}</span>
              )}
            </p>
          </Card>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Patient Name *</Label>
              <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Phone Number</Label>
              <Input value={form.patient_phone} onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Address *</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter your full address" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Time Slot *</Label>
              <Select value={form.scheduled_time} onValueChange={(v) => setForm({ ...form, scheduled_time: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Booking Type</Label>
              <Select value={form.booking_type} onValueChange={(v) => setForm({ ...form, booking_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Payment Method *</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: Banknote },
                  { value: 'upi', label: 'UPI', icon: Smartphone },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      form.payment_method === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              {form.payment_method === 'upi' && (
                <p className="text-xs text-muted-foreground mt-2">UPI payment link will be shared after booking confirmation.</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." />
            </div>

            <Button
              className="w-full h-12 rounded-xl font-semibold"
              onClick={handleBook}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? 'Booking...' : `Book Now — ₹${service.price}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}