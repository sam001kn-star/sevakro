import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, Share, User, Stethoscope, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

function IOSGuide({ title, accentClass, onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      >
        <div className="bg-card rounded-t-3xl p-6 pb-10 shadow-2xl">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Install {title} on iPhone</h3>
            <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <StepItem num={1} icon={<Share className="w-4 h-4" />} text="Tap the Share button at the bottom of Safari" accentClass={accentClass} />
            <StepItem num={2} icon={<Download className="w-4 h-4" />} text='Scroll down and tap "Add to Home Screen"' accentClass={accentClass} />
            <StepItem num={3} icon={<Smartphone className="w-4 h-4" />} text='Tap "Add" in the top right corner' accentClass={accentClass} />
          </div>
          <Button className={`w-full mt-6 ${accentClass}`} onClick={onClose}>Got it</Button>
        </div>
      </motion.div>
    </>
  );
}

function StepItem({ num, icon, text, accentClass }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${accentClass}`}>
        {num}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <span>{icon}</span>
        <p className="text-sm text-foreground">{text}</p>
      </div>
    </div>
  );
}

const apps = [
  {
    id: 'user',
    label: 'User App',
    subtitle: 'Book home healthcare services',
    icon: User,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    btnClass: 'bg-primary hover:bg-primary/90',
    guideBg: 'bg-primary',
  },
  {
    id: 'staff',
    label: 'Staff App',
    subtitle: 'Manage your nurse/caregiver jobs',
    icon: Stethoscope,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    btnClass: 'bg-blue-600 hover:bg-blue-700',
    guideBg: 'bg-blue-600',
    portalPath: '/staff-portal',
  },
  {
    id: 'doctor',
    label: 'Doctor App',
    subtitle: 'Manage patient appointments',
    icon: HeartPulse,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    btnClass: 'bg-green-700 hover:bg-green-800',
    guideBg: 'bg-green-700',
    portalPath: '/doctor-portal',
  },
];

export default function InstallAppSheet({ open, onClose }) {
  const { install, canInstall, isInstalled, isIOS } = usePWA();
  const [iosGuide, setIosGuide] = useState(null); // app id

  const handleInstall = async (app) => {
    if (app.portalPath) {
      // For staff/doctor: open their portal URL in a new tab for install
      window.open(window.location.origin + app.portalPath, '_blank');
      return;
    }
    if (isIOS) {
      setIosGuide(app.id);
    } else {
      await install();
      onClose();
    }
  };

  const activeGuide = iosGuide ? apps.find(a => a.id === iosGuide) : null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto"
            >
              <div className="bg-card rounded-t-3xl p-6 pb-10 shadow-2xl">
                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-lg">Install App</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose your version to install</p>
                  </div>
                  <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>

                <div className="space-y-3">
                  {apps.map((app) => {
                    const Icon = app.icon;
                    return (
                      <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${app.iconBg}`}>
                          <Icon className={`w-5 h-5 ${app.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{app.label}</p>
                          <p className="text-xs text-muted-foreground">{app.subtitle}</p>
                        </div>
                        <Button
                          size="sm"
                          className={`h-8 text-xs px-4 rounded-lg text-white ${app.btnClass}`}
                          onClick={() => handleInstall(app)}
                        >
                          {app.portalPath ? 'Open' : (isInstalled ? 'Installed' : isIOS ? 'How?' : 'Install')}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {!isIOS && !canInstall && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    To install the User App, open this page in your browser and use "Add to Home Screen"
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* iOS guide per app */}
      <AnimatePresence>
        {activeGuide && (
          <IOSGuide
            title={activeGuide.label}
            accentClass={activeGuide.guideBg}
            onClose={() => setIosGuide(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}