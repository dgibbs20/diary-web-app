/**
 * Register Page — Quiet Luxury aesthetic
 */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AUTH_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663029844115/cw39joRvygwi83an4yvvJL/auth-bg-EbDrbgB9XmpwVMmEp2nJa3.webp';
const LOGO_URL = '/manus-storage/logo_c40e17b6.png';

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = "w-full px-4 py-3 rounded-lg border bg-white/60 font-serif text-base focus:outline-none transition-all";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#C9A84C';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#EDE7D9';
    e.currentTarget.style.boxShadow = 'none';
  };

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

  return (
    <div className="min-h-screen flex">
      {/* Left panel — image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={AUTH_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F5F0E8]/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <p className="font-serif italic text-2xl" style={{ color: '#5C3D2A' }}>
            "Begin the journey of knowing yourself —<br />one page at a time."
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16" style={{ backgroundColor: '#F5F0E8' }}>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-10">
            <Link href="/"><img src={LOGO_URL} alt="diAry" className="h-16 w-auto" /></Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-light" style={{ color: '#2C1A0E' }}>Create Your Space</h1>
            <p className="mt-2 text-sm" style={{ color: '#8B6347' }}>Your words, your world, your diary</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Full Name</label>
              <input
                type="text" value={fullname} onChange={(e) => setFullname(e.target.value)}
                className={inputStyle} style={{ borderColor: '#EDE7D9', color: '#2C1A0E' }}
                onFocus={handleFocus} onBlur={handleBlur}
                placeholder="Your full name" autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputStyle} style={{ borderColor: '#EDE7D9', color: '#2C1A0E' }}
                onFocus={handleFocus} onBlur={handleBlur}
                placeholder="your@email.com" autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`${inputStyle} pr-12`} style={{ borderColor: '#EDE7D9', color: '#2C1A0E' }}
                  onFocus={handleFocus} onBlur={handleBlur}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#8B6347' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>Confirm Password</label>
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle} style={{ borderColor: '#EDE7D9', color: '#2C1A0E' }}
                onFocus={handleFocus} onBlur={handleBlur}
                placeholder="Confirm your password" autoComplete="new-password"
              />
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-6"
              style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(201,168,76,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: '#8B6347' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#C9A84C' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
