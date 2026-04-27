/**
 * Login Page — Premium split layout matching marketing site quality
 * Left: Brand hero with logo_hero image and tagline
 * Right: Clean login form with gold accents
 */
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import React, { useState, useRef } from 'react';

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const emailInput = formRef.current?.querySelector('input[type="email"]') as HTMLInputElement;
      emailInput?.focus();
    }, 300);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F0E8', paddingTop: '70px' }}>
      {/* Left panel — Brand hero with logo on cream background, matching marketing site hero */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ backgroundColor: '#EDE7D9' }}
      >
        {/* Subtle radial glow — matching marketing site hero-glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
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
            style={{
              height: '200px',
              display: 'block',
              margin: '0 auto 32px',
              filter: 'drop-shadow(0 8px 32px rgba(201,168,76,0.35))',
            }}
          />
          <p
            className="font-serif italic"
            style={{ fontSize: '1.65rem', color: '#5C3D2A', marginBottom: '20px', letterSpacing: '0.04em' }}
          >
            "I'll never tell..."
          </p>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#8B6347',
              maxWidth: '420px',
              margin: '0 auto 32px',
              fontWeight: 300,
              lineHeight: 1.75,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            Your thoughts deserve a space that truly understands them. Write it, speak it, draw it — diAry listens with warmth and keeps your secrets forever.
          </p>
          <button
            onClick={scrollToForm}
            className="px-8 py-3 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
              color: '#F5F0E8',
              boxShadow: '0 2px 16px rgba(168, 134, 58, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(168, 134, 58, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 16px rgba(168, 134, 58, 0.25)';
            }}
          >
            Sign In
          </button>
        </motion.div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 pt-20">
        <motion.div
          ref={formRef}
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/assets/images/logo.png" alt="diAry" className="h-16 w-auto mb-3" />
            <p className="font-serif italic text-sm" style={{ color: '#8B7355' }}>
              "I'll never tell..."
            </p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: '#A8863A' }}>
              Welcome Back
            </p>
            <h1 className="font-serif text-3xl font-light" style={{ color: '#3D2B1F' }}>
              Sign In
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#8B7355' }}>
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
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderColor: 'rgba(168, 134, 58, 0.15)',
                  color: '#3D2B1F',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(168, 134, 58, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium tracking-wider uppercase" style={{ color: '#5C3D2A' }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#A8863A' }}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-lg border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    borderColor: 'rgba(168, 134, 58, 0.15)',
                    color: '#3D2B1F',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(168, 134, 58, 0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#8B7355' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 accent-[#C9A84C]"
              />
              <span className="text-sm" style={{ color: '#6B5744' }}>Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                color: '#F5F0E8',
                boxShadow: '0 2px 16px rgba(168, 134, 58, 0.25)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 134, 58, 0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(168, 134, 58, 0.25)'; }}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm" style={{ color: '#8B7355' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: '#A8863A' }}>
              Create Account
            </Link>
          </p>

          {/* Mobile features badge */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(168, 134, 58, 0.1)' }}>
            <p className="text-center text-xs" style={{ color: '#8B7355' }}>
              Voice journaling, handwriting OCR &amp; biometric login available on{' '}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(201,168,76,0.12)', color: '#A8863A' }}>
                Mobile App
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
