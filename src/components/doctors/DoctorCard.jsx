import { Star, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DoctorCard({ doctor, onBook }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4 flex gap-3"
    >
      <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
        {doctor.profile_image_url ? (
          <img src={doctor.profile_image_url} alt={doctor.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary font-bold text-xl">
            {doctor.full_name?.[0] || 'D'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">
          Dr. {doctor.full_name}
        </h3>
        <p className="text-xs text-muted-foreground mb-1">
          {doctor.specialization || 'General Physician'}
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span className="text-xs font-medium">{doctor.rating || 4.5}</span>
          </div>
          {doctor.experience_years && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {doctor.experience_years} yrs exp
            </Badge>
          )}
        </div>
        {doctor.clinic_address && (
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate">{doctor.clinic_address}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">₹{doctor.consultation_fee || 500}</span>
          <Button
            size="sm"
            onClick={() => onBook?.(doctor)}
            className="rounded-full text-xs px-4 h-7"
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}