/**
 * Subscription Page — diAry
 * 
 * Design: Premium comparison cards matching marketing site quality.
 * Brand: Cormorant Garamond headings, gold accents (#C9A84C), cream/brown palette.
 * Flow: Free vs Elite side-by-side → Choose monthly/annual → RevenueCat payment link with user ID.
 * Post-payment: User returns to /dashboard, app calls /subscription/verify to sync tier.
 * 
 * LOGOS: Uses uploaded logo.png (Free card) and logo_elite.png (Elite card) instead of text.
 * TOGGLE: billingCycle state drives price display on Elite card.
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Check, X, Sparkles, BookOpen, Brain, Shield, BarChart3,
  FileText, Mic, PenTool, Lock, Zap, ArrowRight
} from 'lucide-react';

const REVENUECAT_MONTHLY = 'https://pay.rev.cat/fcxkvesvqsmqyjgj';
const REVENUECAT_ANNUAL = 'https://pay.rev.cat/dgnllmadailgfknc';

const LOGO_FREE = '/assets/images/logo.png';
const LOGO_ELITE = '/assets/images/elite_logo.png';

interface PlanFeature {
  label: string;
  icon: React.ReactNode;
  free: boolean | string;
  elite: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { label: 'Unlimited Journal Entries', icon: <BookOpen size={18} />, free: true, elite: true },
  { label: 'Text Input', icon: <PenTool size={18} />, free: true, elite: true },
  { label: 'Basic Mood Tracking', icon: <Sparkles size={18} />, free: true, elite: true },
  { label: 'Basic Statistics', icon: <BarChart3 size={18} />, free: true, elite: true },
  { label: 'Biometric Lock', icon: <Lock size={18} />, free: true, elite: true },
  { label: 'AI Companion Responses', icon: <Brain size={18} />, free: '5 / day', elite: 'Unlimited' },
  { label: 'AI Modes (Auto & Vault)', icon: <Brain size={18} />, free: true, elite: true },
  { label: 'AI Modes (Friend, Mirror, Insight)', icon: <Brain size={18} />, free: false, elite: true },
  { label: 'Voice Transcription', icon: <Mic size={18} />, free: '3 / day', elite: 'Unlimited' },
  { label: 'Advanced Analytics & Insights', icon: <BarChart3 size={18} />, free: false, elite: true },
  { label: 'Mood Trends & Pattern Detection', icon: <Sparkles size={18} />, free: false, elite: true },
  { label: 'Journal Export (PDF)', icon: <FileText size={18} />, free: false, elite: true },
  { label: 'Ghost Mode (Privacy)', icon: <Shield size={18} />, free: false, elite: true },
  { label: 'Priority Support', icon: <Zap size={18} />, free: false, elite: true },
];

export default function Subscription() {
  const { user, isElite } = useAuth();
  const [, navigate] = useLocation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const userId = user?.id;

  const handleUpgrade = () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    const baseUrl = billingCycle === 'monthly' ? REVENUECAT_MONTHLY : REVENUECAT_ANNUAL;
    const paymentUrl = `${baseUrl}/${userId}`;
    window.open(paymentUrl, '_blank');
  };

  const monthlyPrice = 9.99;
  const annualPrice = 79.99;
  const annualMonthly = (annualPrice / 12).toFixed(2);
  const savings = Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100);

  // Derived display values based on billingCycle
  const displayPrice = billingCycle === 'annual' ? annualMonthly : monthlyPrice.toFixed(2);
  const billingNote = billingCycle === 'annual'
    ? `Billed $${annualPrice} annually`
    : 'Billed monthly, cancel anytime';

  return (
    <div className="min-h-screen pt-[70px]" style={{ backgroundColor: '#FAF6F0' }}>
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown size={32} style={{ color: '#C9A84C' }} />
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#2C1A0E' }}
            >
              Choose Your Plan
            </h1>
          </div>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#6B5B4E' }}
          >
            Unlock the full power of your private journaling companion.
            {isElite && ' You are currently on the Elite plan.'}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        {!isElite && (
          <motion.div
            className="flex items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1rem',
                backgroundColor: billingCycle === 'monthly' ? '#C9A84C' : 'transparent',
                color: billingCycle === 'monthly' ? '#FFFFFF' : '#6B5B4E',
                border: `1.5px solid ${billingCycle === 'monthly' ? '#C9A84C' : '#D4C5B0'}`,
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1rem',
                backgroundColor: billingCycle === 'annual' ? '#C9A84C' : 'transparent',
                color: billingCycle === 'annual' ? '#FFFFFF' : '#6B5B4E',
                border: `1.5px solid ${billingCycle === 'annual' ? '#C9A84C' : '#D4C5B0'}`,
              }}
            >
              Annual
              <span
                className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#2C1A0E', color: '#C9A84C', fontSize: '0.65rem' }}
              >
                SAVE {savings}%
              </span>
            </button>
          </motion.div>
        )}
      </section>

      {/* Plan Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            className="rounded-2xl p-8 md:p-10 relative"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8DFD4',
              boxShadow: '0 4px 24px rgba(44, 26, 14, 0.06)',
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-8">
              {/* Logo image instead of text */}
              <img
                src={LOGO_FREE}
                alt="diAry"
                className="h-14 md:h-16 object-contain mb-2"
              />
              <p
                className="text-sm mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#8B7B6E' }}
              >
                Your private journaling companion
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl md:text-5xl font-bold"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#2C1A0E' }}
                >
                  Free
                </span>
              </div>
              <p className="text-sm mt-2" style={{ color: '#8B7B6E' }}>Forever</p>
            </div>

            <div className="space-y-3">
              {FEATURES.map((f, i) => {
                const val = f.free;
                const available = val === true || typeof val === 'string';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: available ? 'rgba(201, 168, 76, 0.15)' : 'rgba(139, 123, 110, 0.1)',
                      }}
                    >
                      {available ? (
                        <Check size={12} style={{ color: '#C9A84C' }} />
                      ) : (
                        <X size={12} style={{ color: '#B0A090' }} />
                      )}
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        color: available ? '#4A3B30' : '#B0A090',
                        textDecoration: available ? 'none' : 'line-through',
                      }}
                    >
                      {f.label}
                      {typeof val === 'string' && (
                        <span className="ml-1 font-semibold" style={{ color: '#8B7B6E' }}>
                          ({val})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {!isElite && (
              <div className="mt-8">
                <div
                  className="w-full py-3 rounded-xl text-center text-sm font-medium"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1rem',
                    backgroundColor: '#F5F0E8',
                    color: '#6B5B4E',
                    border: '1px solid #E8DFD4',
                  }}
                >
                  Current Plan
                </div>
              </div>
            )}
          </motion.div>

          {/* Elite Plan */}
          <motion.div
            className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
            style={{
              backgroundColor: '#2C1A0E',
              border: '2px solid #C9A84C',
              boxShadow: '0 8px 40px rgba(201, 168, 76, 0.2)',
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Glow effect */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.2), transparent)' }}
            />

            {/* Popular badge */}
            <div
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#C9A84C', color: '#2C1A0E' }}
            >
              MOST POPULAR
            </div>

            <div className="mb-8 relative z-10">
              {/* Logo image instead of text */}
              <img
                src={LOGO_ELITE}
                alt="diAry Elite"
                className="h-16 md:h-20 object-contain mb-2"
              />
              <p
                className="text-sm mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(201, 168, 76, 0.7)' }}
              >
                Unlock every feature, no limits
              </p>

              {/* Price — animated on toggle change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={billingCycle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl md:text-5xl font-bold"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#FFFFFF' }}
                    >
                      ${displayPrice}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>/month</span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: 'rgba(201, 168, 76, 0.7)' }}>
                    {billingNote}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3 relative z-10">
              {FEATURES.map((f, i) => {
                const val = f.elite;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(201, 168, 76, 0.2)' }}
                    >
                      <Check size={12} style={{ color: '#C9A84C' }} />
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        color: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {f.label}
                      {typeof val === 'string' && (
                        <span className="ml-1 font-semibold" style={{ color: '#C9A84C' }}>
                          ({val})
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 relative z-10">
              {isElite ? (
                <div
                  className="w-full py-3 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1rem',
                    backgroundColor: 'rgba(201, 168, 76, 0.15)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                  }}
                >
                  <Crown size={16} />
                  Your Current Plan
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.05rem',
                    backgroundColor: '#C9A84C',
                    color: '#2C1A0E',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 20px rgba(201, 168, 76, 0.4)',
                  }}
                >
                  Upgrade to Elite
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Trust Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p
            className="text-sm"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#8B7B6E' }}
          >
            Secure payment powered by Stripe via RevenueCat. Cancel anytime.
          </p>
          <p
            className="text-sm mt-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#8B7B6E' }}
          >
            Your subscription syncs across all your devices — mobile and web.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
