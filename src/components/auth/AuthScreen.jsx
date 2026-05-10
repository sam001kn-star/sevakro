import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Stethoscope, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCustomAuth } from '@/lib/CustomAuthContext';
import { loginUser, registerUser } from '@/lib/authService';
import { generateAndSendOtp, verifyLoginOtp } from '@/lib/otpService';
import OtpVerifyScreen from '@/components/auth/OtpVerifyScreen';
import StaffAuthScreen from '@/components/auth/StaffAuthScreen';
import DoctorAuthScreen from '@/components/auth/DoctorAuthScreen';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referral_code_input: z.string().optional(),
});

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1 ml-1">{message}</p>;
}

const ROLES = [
  { id: 'user', label: 'Patient', icon: User, desc: 'Book healthcare services' },
  { id: 'staff', label: 'Staff / Nurse', icon: Stethoscope, desc: 'Provide home care services' },
  { id: 'doctor', label: 'Doctor', icon: UserCheck, desc: 'Manage consultations' },
];

export default function AuthScreen() {
  const { login } = useCustomAuth();
  const [role, setRole] = useState(null); // null = role picker
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [loginPendingUser, setLoginPendingUser] = useState(null);

  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const registerForm = useForm({ resolver: zodResolver(registerSchema), defaultValues: { full_name: '', email: '', phone: '', password: '', referral_code_input: '' } });

  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;

  const handleLogin = async (data) => {
    const { user } = await loginUser({ ...data, role: 'user' });
    await generateAndSendOtp(user.id, user.email, user.full_name);
    toast.success('Verification code sent to your email!');
    setLoginPendingUser(user);
  };

  const handleRegister = async (data) => {
    const { user, referralApplied, isResume } = await registerUser({ ...data, role: 'user' });
    await generateAndSendOtp(user.id, user.email, user.full_name);
    if (referralApplied) toast.success('🎉 Referral applied! ₹100 added to both wallets.');
    toast.success(isResume ? 'Verification code resent to your email!' : 'Verification code sent to your email!');
    setPendingUser(user);
  };

  const wrap = (form, handler) => form.handleSubmit(async (data) => {
    try { await handler(data); }
    catch (err) { form.setError('root', { message: err.message || 'Something went wrong.' }); }
  });

  // Delegate to role-specific screens
  if (role === 'staff') return <StaffAuthScreen onBack={() => setRole(null)} />;
  if (role === 'doctor') return <DoctorAuthScreen onBack={() => setRole(null)} />;

  if (loginPendingUser) {
    return (
      <OtpVerifyScreen
        userAuthId={loginPendingUser.id}
        email={loginPendingUser.email}
        fullName={loginPendingUser.full_name}
        onVerified={() => { login(loginPendingUser); toast.success(`Welcome back, ${loginPendingUser.full_name}!`); }}
        onBack={() => setLoginPendingUser(null)}
        verifyFn={verifyLoginOtp}
      />
    );
  }

  if (pendingUser) {
    return (
      <OtpVerifyScreen
        userAuthId={pendingUser.id}
        email={pendingUser.email}
        fullName={pendingUser.full_name}
        onVerified={() => { login({ ...pendingUser, email_verified: true }); toast.success(`Welcome, ${pendingUser.full_name}!`); }}
        onBack={() => setPendingUser(null)}
      />
    );
  }

  // === ROLE PICKER ===
  if (!role) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-5 overflow-y-auto py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
            <HeartPulse className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">PulseCare</h1>
          <p className="text-sm text-muted-foreground mt-1">Healthcare at your doorstep</p>
        </motion.div>

        <p className="text-sm font-semibold text-foreground mb-4">Who are you?</p>
        <div className="w-full max-w-sm space-y-3">
          {ROLES.map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setRole(r.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <r.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // === PATIENT LOGIN / REGISTER ===
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-5 overflow-y-auto py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
          <HeartPulse className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">PulseCare</h1>
        <p className="text-sm text-muted-foreground mt-1">Patient Portal</p>
      </motion.div>

      <div className="flex bg-muted rounded-xl p-1 mb-6 w-full max-w-sm">
        {['login', 'register'].map(m => (
          <button key={m} type="button"
            onClick={() => { setMode(m); loginForm.clearErrors(); registerForm.clearErrors(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
            {m === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm"
        >
          {mode === 'login' ? (
            <form onSubmit={wrap(loginForm, handleLogin)} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="Email Address *" className="pl-9" {...loginForm.register('email')} />
                </div>
                <FieldError message={loginForm.formState.errors.email?.message} />
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPass ? 'text' : 'password'} placeholder="Password *" className="pl-9 pr-9" {...loginForm.register('password')} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={loginForm.formState.errors.password?.message} />
              </div>
              {loginForm.formState.errors.root && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{loginForm.formState.errors.root.message}</p>
              )}
              <Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={wrap(registerForm, handleRegister)} className="space-y-3">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Full Name *" className="pl-9" {...registerForm.register('full_name')} />
                </div>
                <FieldError message={registerForm.formState.errors.full_name?.message} />
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="Email Address *" className="pl-9" {...registerForm.register('email')} />
                </div>
                <FieldError message={registerForm.formState.errors.email?.message} />
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="tel" placeholder="Phone Number" className="pl-9" {...registerForm.register('phone')} />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPass ? 'text' : 'password'} placeholder="Password *" className="pl-9 pr-9" {...registerForm.register('password')} />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={registerForm.formState.errors.password?.message} />
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">REF</span>
                  <Input placeholder="Referral Code (optional)" className="pl-10 font-mono uppercase" maxLength={12} {...registerForm.register('referral_code_input')} />
                </div>
              </div>
              {registerForm.formState.errors.root && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{registerForm.formState.errors.root.message}</p>
              )}
              <Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Account
              </Button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button type="button" className="text-primary font-semibold"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Register' : 'Sign In'}
        </button>
      </p>

      <button type="button" onClick={() => setRole(null)} className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors">
        ← Back to role selection
      </button>
    </div>
  );
}