import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Mail, Lock, Eye, EyeOff, Loader2, User, Phone, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useCustomAuth } from '@/lib/CustomAuthContext';
import { loginUser, registerUser } from '@/lib/authService';
import { generateAndSendOtp, verifyLoginOtp } from '@/lib/otpService';
import OtpVerifyScreen from '@/components/auth/OtpVerifyScreen';

export default function DoctorAuthScreen({ onBack }) {
  const { login } = useCustomAuth();
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [loginPendingUser, setLoginPendingUser] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', specialization: '', qualification: '', experience_years: '' });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await loginUser({ email: form.email, password: form.password, role: 'doctor' });
      await generateAndSendOtp(user.id, user.email, user.full_name);
      toast.success('Verification code sent to your email!');
      setLoginPendingUser(user);
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { user, isResume } = await registerUser({
        email: form.email, password: form.password,
        full_name: form.full_name, phone: form.phone, role: 'doctor',
      });

      // Create Doctor profile record only if new account
      if (!isResume) {
        await base44.entities.Doctor.create({
          email: user.email,
          full_name: user.full_name,
          phone: user.phone || '',
          specialization: form.specialization.trim(),
          qualification: form.qualification.trim(),
          experience_years: form.experience_years ? parseInt(form.experience_years) : 0,
          is_active: true,
        });
      }

      await generateAndSendOtp(user.id, user.email, user.full_name);
      toast.success(isResume ? 'Verification code resent to your email!' : 'OTP sent to your email.');
      setPendingUser(user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
    setLoading(false);
  };

  if (loginPendingUser) {
    return (
      <OtpVerifyScreen
        userAuthId={loginPendingUser.id}
        email={loginPendingUser.email}
        fullName={loginPendingUser.full_name}
        onVerified={() => {
          login(loginPendingUser);
          toast.success(`Welcome back, Dr. ${loginPendingUser.full_name}!`);
        }}
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
        onVerified={() => {
          login({ ...pendingUser, email_verified: true });
          toast.success(`Welcome, Dr. ${pendingUser.full_name}!`);
        }}
        onBack={() => setPendingUser(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-5 overflow-y-auto py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
          <HeartPulse className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">PulseCare Doctor Access</p>
      </motion.div>

      <div className="flex bg-muted rounded-xl p-1 mb-6 w-full max-w-sm">
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
            {m === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.form key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          onSubmit={mode === 'login' ? handleLogin : handleRegister}
          className="w-full max-w-sm space-y-3"
        >
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full Name *" value={form.full_name} onChange={set('full_name')} className="pl-9" required />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="Email Address *" value={form.email} onChange={set('email')} className="pl-9" required />
          </div>
          {mode === 'register' && (
            <>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="Phone Number" value={form.phone} onChange={set('phone')} className="pl-9" />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Specialization (e.g. Cardiologist)" value={form.specialization} onChange={set('specialization')} className="pl-9" />
              </div>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Qualification (e.g. MBBS, MD)" value={form.qualification} onChange={set('qualification')} className="pl-9" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">YRS</span>
                <Input type="number" min="0" max="60" placeholder="Years of Experience" value={form.experience_years} onChange={set('experience_years')} className="pl-10" />
              </div>
            </>
          )}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type={showPass ? 'text' : 'password'} placeholder="Password *" value={form.password} onChange={set('password')} className="pl-9 pr-9" required />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {mode === 'login' ? 'Sign In to Doctor Portal' : 'Create Doctor Account'}
          </Button>
        </motion.form>
      </AnimatePresence>

      {onBack ? (
        <button type="button" onClick={onBack} className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to role selection
        </button>
      ) : (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Not a doctor?{' '}
          <a href="/" className="text-primary font-semibold">Go to User App</a>
        </p>
      )}
    </div>
  );
}