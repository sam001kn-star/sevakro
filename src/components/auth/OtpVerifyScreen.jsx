import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MailCheck, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { verifyOtp, generateAndSendOtp } from '@/lib/otpService';


export default function OtpVerifyScreen({ userAuthId, email, fullName, onVerified, onBack, verifyFn }) {
  const doVerify = verifyFn || verifyOtp;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next);
      } else if (index > 0) inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otp = digits.join('');
  const isFull = otp.length === 6;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isFull) { toast.error('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      await doVerify(userAuthId, otp);
      onVerified();
    } catch (err) {
      toast.error(err.message || 'Incorrect or expired code.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await generateAndSendOtp(userAuthId, email, fullName);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New code sent to your email.');
    } catch {
      toast.error('Failed to resend code.');
    }
    setResending(false);
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Verify Your Email</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </motion.div>

      <form onSubmit={handleVerify} className="w-full max-w-sm space-y-6">
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-11 h-14 rounded-xl border-2 text-center text-xl font-bold font-mono
                bg-card text-foreground outline-none transition-all
                ${d ? 'border-primary shadow-sm shadow-primary/20' : 'border-border'}
                focus:border-primary focus:shadow-sm focus:shadow-primary/20
              `}
            />
          ))}
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={loading || !isFull}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Verify & Continue
        </Button>
      </form>

      <div className="flex items-center gap-3 mt-6">
        <button type="button" onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </button>
        <span className="text-muted-foreground">•</span>
        <button type="button" onClick={handleResend} disabled={resending}
          className="text-xs text-primary font-semibold flex items-center gap-1 disabled:opacity-50">
          {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Resend Code
        </button>
      </div>
    </div>
  );
}