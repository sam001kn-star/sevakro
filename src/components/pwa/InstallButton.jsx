import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export default function InstallButton({ className = '' }) {
  const { install, canInstall, isInstalled, isIOS } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !canInstall) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      await install();
    }
  };

  return (
    <>
      {/* Compact install banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2 ${className}`}
      >
        <Smartphone className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground flex-1">
          <span className="font-semibold">Install PulseCare</span>
          <span className="text-muted-foreground"> for quick access</span>
        </p>
        <Button size="sm" onClick={handleClick} className="h-7 text-xs px-3 rounded-lg">
          {isIOS ? 'How?' : 'Install'}
        </Button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* iOS guide modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowIOSGuide(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            >
              <div className="bg-card rounded-t-3xl p-6 pb-10 shadow-2xl">
                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Install on iPhone</h3>
                  <button onClick={() => setShowIOSGuide(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Step num={1} icon={<Share className="w-4 h-4" />} text='Tap the Share button at the bottom of Safari' />
                  <Step num={2} icon={<Download className="w-4 h-4" />} text='Scroll down and tap "Add to Home Screen"' />
                  <Step num={3} icon={<Smartphone className="w-4 h-4" />} text='Tap "Add" in the top right corner' />
                </div>
                <Button className="w-full mt-6" onClick={() => setShowIOSGuide(false)}>Got it</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ num, icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
        {num}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <span className="text-primary">{icon}</span>
        <p className="text-sm text-foreground">{text}</p>
      </div>
    </div>
  );
}