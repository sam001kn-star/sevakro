import { Button } from '@/components/ui/button';
import { Stethoscope, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


export default function HeroSection() {
  return (
    <div className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-5 text-primary-foreground relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <h2 className="text-lg font-bold mb-1 relative z-10">
          Quality Healthcare
        </h2>
        <p className="text-xs opacity-80 mb-4 relative z-10">
          Professional nursing & doctor services at your doorstep
        </p>
        <div className="flex gap-2 relative z-10">
          <Button
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-xs gap-1.5 rounded-full px-4"
            onClick={() => document.getElementById('service-grid')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Home Services
          </Button>
          <Link to="/doctors">
            <Button
              size="sm"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-xs gap-1.5 rounded-full px-4"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Book Doctor
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}