/**
 * Login Page — Quiet Luxury aesthetic
 * Split layout: left image panel, right form panel
 */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AUTH_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663029844115/cw39joRvygwi83an4yvvJL/auth-bg-EbDrbgB9XmpwVMmEp2nJa3.webp';
const LOGO_URL = '/assets/images/logo.png';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('diary_remember_email', email);
      }
      navigate('/dashboard');
    } else if (result.needsVerification) {
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={AUTH_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F5F0E8]/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <p className="font-serif italic text-2xl text-brown-mid" style={{ color: '#5C3D2A' }}>
            "The pages that hold your truth<br />are the ones that set you free."
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
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link href="/">
              <img src={LOGO_URL} alt="diAry" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-light" style={{ color: '#2C1A0E' }}>
              Welcome Back
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#8B6347' }}>
              Your private space awaits
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-white/60 font-serif text-base focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#EDE7D9',
                  color: '#2C1A0E',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#EDE7D9'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: '#5C3D2A' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border bg-white/60 font-serif text-base focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: '#EDE7D9',
                    color: '#2C1A0E',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EDE7D9'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#8B6347' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 accent-[#C9A84C]"
                />
                <span className="text-sm" style={{ color: '#5C3D2A' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#C9A84C' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                color: '#F5F0E8',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(201,168,76,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm" style={{ color: '#8B6347' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: '#C9A84C' }}>
              Create one
            </Link>
          </p>

          {/* Mobile-only features badge */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#EDE7D9' }}>
            <p className="text-center text-xs" style={{ color: '#8B6347' }}>
              Looking for voice journaling, handwriting, or biometric login?{' '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(201,168,76,0.12)', color: '#A8863A' }}>
                Mobile Exclusive
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
