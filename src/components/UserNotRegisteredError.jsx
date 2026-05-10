import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartPulse, User, Phone, CheckCircle2, Loader2 } from 'lucide-react';

const UserNotRegisteredError = () => {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ full_name: '', phone: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;

    setStep('loading');
    try {
      // Get the current authenticated user's email from the SDK
      const me = await base44.auth.me().catch(() => null);
      if (!me?.email) throw new Error('Could not determine your email. Please try logging in again.');

      // Self-register as a regular user
      await base44.users.inviteUser(me.email, 'user');

      // Optionally save additional profile info
      try {
        await base44.auth.updateMe({ full_name: form.full_name, phone: form.phone });
      } catch {}

      setStep('success');

      // Reload after a short delay so AuthContext re-checks
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
      setStep('error');
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Welcome to PulseCare!</h2>
          <p className="text-sm text-muted-foreground">Your account is ready. Loading your dashboard…</p>
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Creating your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
            <HeartPulse className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join PulseCare</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Complete your profile to access healthcare services
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Priya Sharma"
                value={form.full_name}
                onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                className="pl-9"
              />
            </div>
          </div>

          {step === 'error' && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <Button type="submit" className="w-full mt-2">
            Create My Account
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already registered?{' '}
          <button
            className="text-primary font-medium underline"
            onClick={() => base44.auth.logout()}
          >
            Sign out &amp; try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;