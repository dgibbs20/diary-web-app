/**
 * Forgot Password Page — Premium design
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) setSent(true);
      else toast.error(res.error?.message || 'Failed to send reset email');
    } catch { toast.error('Network error. Please try again.'); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#F5F0E8', paddingTop: '90px' }}>
      <motion.div className="w-full max-w-md text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link href="/"><img src="/assets/images/logo.png" alt="diAry" className="h-14 w-auto mx-auto mb-8" /></Link>

        {sent ? (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(168, 134, 58, 0.1)' }}>
              <CheckCircle2 size={28} style={{ color: '#A8863A' }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: '#A8863A' }}>Success</p>
            <h1 className="font-serif text-2xl font-light mb-2" style={{ color: '#3D2B1F' }}>Check Your Email</h1>
            <p className="text-sm mb-8" style={{ color: '#8B7355' }}>
              If an account exists for <span className="font-medium" style={{ color: '#5C3D2A' }}>{email}</span>,
              you'll receive a password reset link shortly.
            </p>
            <Link href="/login"
              className="inline-block py-3 px-8 rounded-lg text-sm font-medium tracking-wider uppercase"
              style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8', boxShadow: '0 2px 16px rgba(168, 134, 58, 0.25)' }}>
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(168, 134, 58, 0.1)' }}>
              <KeyRound size={28} style={{ color: '#A8863A' }} />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: '#A8863A' }}>Account Recovery</p>
            <h1 className="font-serif text-2xl font-light mb-2" style={{ color: '#3D2B1F' }}>Reset Password</h1>
            <p className="text-sm mb-8" style={{ color: '#8B7355' }}>Enter your email and we'll send you a reset link</p>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(168, 134, 58, 0.15)', color: '#3D2B1F' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(168, 134, 58, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="your@email.com" autoComplete="email" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8', boxShadow: '0 2px 16px rgba(168, 134, 58, 0.25)' }}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <Link href="/login" className="inline-block mt-6 text-sm hover:underline" style={{ color: '#8B7355' }}>
              Back to sign in
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
