import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import BookingCard from '@/components/booking/BookingCard';
import { CalendarCheck2 } from 'lucide-react';
import { useCustomAuth } from '@/lib/CustomAuthContext';

export default function Bookings() {
  const [tab, setTab] = useState('upcoming');
  const [bookingType, setBookingType] = useState('one_time');
  const { user } = useCustomAuth();
  const userEmail = user?.email;
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', userEmail],
    queryFn: () => base44.entities.Appointment.filter({ user_email: userEmail }, '-created_date', 100),
    enabled: !!userEmail,
    initialData: [],
  });

  const cancelMutation = useMutation({
    mutationFn: (booking) => base44.entities.Appointment.update(booking.id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const filtered = appointments.filter(a =>
    !bookingType || a.booking_type === bookingType || (!a.booking_type && bookingType === 'one_time')
  );
  const upcoming = filtered.filter(a =>
    ['pending', 'accepted', 'in_progress', 'arrived'].includes(a.status)
  );
  const past = filtered.filter(a =>
    ['completed', 'cancelled', 'declined'].includes(a.status)
  );
  const displayList = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">Your bookings</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-muted mb-3">
          <TabsTrigger value="upcoming" className="flex-1 text-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 text-sm">Past</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex gap-2 mb-6">
        <Button
          size="sm"
          variant={bookingType === 'one_time' ? 'default' : 'outline'}
          onClick={() => setBookingType('one_time')}
          className="flex-1 rounded-full text-xs h-9"
        >
          One-time
        </Button>
        <Button
          size="sm"
          variant={bookingType === 'recurring' ? 'default' : 'outline'}
          onClick={() => setBookingType('recurring')}
          className="flex-1 rounded-full text-xs h-9"
        >
          Recurring
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarCheck2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">No {tab} bookings</p>
          <p className="text-xs text-muted-foreground">
            {tab === 'upcoming' ? 'Book a service to get started' : 'Your completed bookings will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(b) => cancelMutation.mutate(b)}
            />
          ))}
        </div>
      )}
    </div>
  );
}