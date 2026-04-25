/**
 * Email Verification (OTP) Page
 */
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = '/manus-storage/logo_c40e17b6.png';

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get email from URL params
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.verifyOtp(email, code);
      if (res.success) {
        toast.success('Email verified successfully!');
        navigate('/login');
      } else {
        toast.error(res.error?.message || 'Invalid verification code');
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authApi.resendOtp(email);
      if (res.success) {
        toast.success('New code sent to your email');
        setResendCooldown(60);
      } else {
        toast.error(res.error?.message || 'Failed to resend code');
      }
    } catch {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#F5F0E8' }}>
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/"><img src={LOGO_URL} alt="diAry" className="h-14 w-auto mx-auto mb-8" /></Link>

        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
          <Mail size={28} style={{ color: '#C9A84C' }} />
        </div>

        <h1 className="font-serif text-2xl font-light mb-2" style={{ color: '#2C1A0E' }}>Verify Your Email</h1>
        <p className="text-sm mb-8" style={{ color: '#8B6347' }}>
          We sent a 6-digit code to<br />
          <span className="font-medium" style={{ color: '#5C3D2A' }}>{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-serif rounded-lg border bg-white/60 focus:outline-none transition-all"
                style={{ borderColor: digit ? '#C9A84C' : '#EDE7D9', color: '#2C1A0E' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = digit ? '#C9A84C' : '#EDE7D9'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            ))}
          </div>

          <button
            type="submit" disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="mt-6 text-sm" style={{ color: '#8B6347' }}>
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="font-medium hover:underline disabled:opacity-50"
            style={{ color: '#C9A84C' }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
          </button>
        </p>

        <Link href="/login" className="inline-block mt-4 text-sm hover:underline" style={{ color: '#8B6347' }}>
          Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
