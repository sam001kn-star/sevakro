import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-accent/20 text-accent-foreground border-accent/30',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  arrived: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  declined: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function BookingCard({ booking, onCancel }) {
  const isPast = booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'declined';

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm">{booking.service_title}</h3>
          <p className="text-xs text-muted-foreground capitalize">{booking.appointment_type} Service</p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${statusColors[booking.status] || ''}`}>
          {booking.status?.replace('_', ' ')}
        </Badge>
      </div>
      <div className="space-y-1.5 mb-3">
        {booking.scheduled_date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(booking.scheduled_date), 'MMM d, yyyy')}</span>
          </div>
        )}
        {booking.scheduled_time && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{booking.scheduled_time}</span>
          </div>
        )}
        {booking.address && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{booking.address}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">₹{booking.amount || 0}</span>
        {!isPast && booking.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 rounded-full text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => onCancel?.(booking)}
          >
            Cancel
          </Button>
        )}
      </div>
      {booking.assigned_staff_name && (
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          Assigned to: <span className="font-medium text-foreground">{booking.assigned_staff_name}</span>
        </div>
      )}
      {booking.token_number && (
        <div className="mt-1 text-xs text-muted-foreground">
          Token: <span className="font-bold text-primary">#{booking.token_number}</span>
        </div>
      )}
    </div>
  );
}