import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ServiceCard({ service, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick?.(service)}
      className="bg-card rounded-xl border border-border p-3 flex flex-col items-start text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="relative w-full">
        {service.rating && (
          <div className="absolute top-0 right-0 flex items-center gap-0.5 bg-card/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-border/50">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span className="text-[10px] font-semibold text-foreground">{service.rating}</span>
            {service.review_count && (
              <span className="text-[9px] text-muted-foreground">({service.review_count})</span>
            )}
          </div>
        )}
        {service.is_new && (
          <Badge className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0 font-bold">
            NEW
          </Badge>
        )}
        <div className="w-full aspect-square rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden mb-2">
          {service.icon_url ? (
            <img
              src={service.icon_url}
              alt={service.title}
              className="w-3/4 h-3/4 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {service.title?.[0]}
              </span>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight mb-1">
        {service.title}
      </h3>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-foreground">
          ₹{service.price}
        </span>
        {service.original_price > service.price && (
          <span className="text-[10px] text-muted-foreground line-through">
            ₹{service.original_price}
          </span>
        )}
      </div>
    </motion.button>
  );
}