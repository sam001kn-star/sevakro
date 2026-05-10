import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomAuth } from '@/lib/CustomAuthContext';
import { getPendingRegistration, clearPendingRegistration } from '@/lib/customAuth';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { login } = useCustomAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }

        // Decode token
        let decoded;
        try { decoded = JSON.parse(atob(decodeURIComponent(token))); } 
        catch { setStatus('error'); setMessage('Malformed verification link.'); return; }

        const { email, otp, ts } = decoded;
        if (!email || !otp) { setStatus('error'); setMessage('Invalid verification link.'); return; }

        // Check expiry (10 min)
        if (Date.now() - ts > 10 * 60 * 1000) {
          setStatus('error');
          setMessage('This verification link has expired. Please request a new one.');
          return;
        }

        // Check if there's a pending registration in localStorage
        const pending = getPendingRegistration();

        if (pending && pending.otp === otp && pending.user?.email === email) {
          // Complete registration verification
          clearPendingRegistration();
          login({ ...pending.user, email_verified: true });
          setStatus('success');
          toast.success(`Welcome, ${pending.user.full_name}!`);
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Fallback: look up the user in UserAuth and mark verified
        try {
          await base44.auth.loginViaEmailPassword(email, '').catch(() => {});
        } catch {}

        const users = await base44.entities.UserAuth.filter({ email });
        if (!users || users.length === 0) {
          setStatus('error');
          setMessage('Account not found. Please register again.');
          return;
        }

        const userRecord = users[0];
        await base44.entities.UserAuth.update(userRecord.id, { email_verified: true });
        login({ ...userRecord, email_verified: true });
        setStatus('success');
        toast.success(`Welcome, ${userRecord.full_name}!`);
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verify();
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-14 h-14 text-primary animate-spin mb-4" />
            <h1 className="text-xl font-bold text-foreground">Verifying your email…</h1>
            <p className="text-sm text-muted-foreground mt-2">Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-foreground">Email Verified!</h1>
            <p className="text-sm text-muted-foreground mt-2">Redirecting you to the app…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-destructive mb-4" />
            <h1 className="text-xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
            <Button className="mt-6" onClick={() => navigate('/')}>Go to Login</Button>
          </>
        )}
      </motion.div>
    </div>
  );
}