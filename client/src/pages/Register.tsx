/**
 * Register Page — Premium split layout matching Login page
 */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password, fullname);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Account created! Please verify your email.');
      navigate(`/verify?email=${encodeURIComponent(result.email || email)}`);
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all";
  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(168, 134, 58, 0.15)',
    color: '#3D2B1F',
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#C9A84C';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(168, 134, 58, 0.15)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F0E8', paddingTop: '70px' }}>
      {/* Left panel — Brand hero with logo on cream bg, matching marketing site */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ backgroundColor: '#EDE7D9' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 65%)', pointerEvents: 'none' }}
        />
        <motion.div
          className="relative z-10 text-center px-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img
            src="/assets/images/logo.png"
            alt="diAry"
            style={{ height: '200px', display: 'block', margin: '0 auto 32px', filter: 'drop-shadow(0 8px 32px rgba(201,168,76,0.35))' }}
          />
          <p
            className="font-serif italic"
            style={{ fontSize: '1.65rem', color: '#5C3D2A', marginBottom: '20px', letterSpacing: '0.04em' }}
          >
            "Begin the journey of knowing yourself —<br />one page at a time."
          </p>
          <p
            style={{ fontSize: '1.05rem', color: '#8B6347', maxWidth: '420px', margin: '0 auto', fontWeight: 300, lineHeight: 1.75, fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Join thousands who trust diAry with their most private thoughts. Military-grade encryption. Zero-knowledge architecture.
          </p>
        </motion.div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 pt-20">
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/assets/images/logo.png" alt="diAry" className="h-16 w-auto mb-3" />
            <p className="font-serif italic text-sm" style={{ color: '#8B7355' }}>"I'll never tell..."</p>
          </div>

          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: '#A8863A' }}>Get Started</p>
            <h1 className="font-serif text-3xl font-light" style={{ color: '#3D2B1F' }}>Create Your Space</h1>
            <p className="mt-2 text-sm" style={{ color: '#8B7355' }}>Your words, your world, your diary</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Full Name</label>
              <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Your full name" autoComplete="name" />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="your@email.com" autoComplete="email" />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-11`} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#8B7355' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Confirm your password" autoComplete="new-password" />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8', boxShadow: '0 2px 16px rgba(168, 134, 58, 0.25)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 134, 58, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(168, 134, 58, 0.25)'; }}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: '#8B7355' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#A8863A' }}>Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
