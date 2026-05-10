import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GPSPrompt({ show, onAllow, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onDismiss}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-[4.5rem] left-0 right-0 z-50 max-w-lg mx-auto px-3"
          >
            <div className="bg-card rounded-3xl p-6 pb-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-1 bg-muted rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <button onClick={onDismiss} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                  <Navigation className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Enable Location</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  Allow PulseCare to use your location so we can show nearby services and provide accurate booking.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onDismiss}
                >
                  Not Now
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={onAllow}
                >
                  <MapPin className="w-4 h-4" />
                  Allow Location
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}