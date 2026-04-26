/**
 * PaywallModal — diAry
 * 
 * Design: Premium modal matching brand aesthetic.
 * Usage: Triggered when free users hit feature limits (AI modes, export, ghost mode).
 * Action: Directs user to /subscription page to choose a plan.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, ArrowRight, Brain, FileText, Shield, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'ai_modes' | 'ai_limit' | 'export' | 'ghost_mode' | 'analytics' | 'general';
}

const FEATURE_INFO: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
  ai_modes: {
    icon: <Brain size={28} />,
    title: 'Unlock All AI Modes',
    description: 'Friend, Mirror, and Insight modes are exclusive to diAry Elite. Upgrade to access deeper, more personalized AI conversations.',
  },
  ai_limit: {
    icon: <Brain size={28} />,
    title: 'AI Response Limit Reached',
    description: "You've used all 5 free AI responses for today. Upgrade to diAry Elite for unlimited AI companion conversations.",
  },
  export: {
    icon: <FileText size={28} />,
    title: 'Export Your Journal',
    description: 'PDF export is an Elite feature. Upgrade to download beautifully formatted copies of your journal entries.',
  },
  ghost_mode: {
    icon: <Shield size={28} />,
    title: 'Enable Ghost Mode',
    description: 'Ghost Mode is an Elite privacy feature. Upgrade to enable enhanced privacy protection for your entries.',
  },
  analytics: {
    icon: <Sparkles size={28} />,
    title: 'Advanced Analytics',
    description: 'Mood trends, pattern detection, and behavioral insights are Elite features. Upgrade to unlock deep self-reflection tools.',
  },
  general: {
    icon: <Crown size={28} />,
    title: 'Upgrade to Elite',
    description: 'Unlock unlimited AI responses, all AI modes, journal export, ghost mode, advanced analytics, and more.',
  },
};

export default function PaywallModal({ isOpen, onClose, feature }: PaywallModalProps) {
  const [, navigate] = useLocation();
  const info = FEATURE_INFO[feature] || FEATURE_INFO.general;

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            style={{ backgroundColor: 'rgba(44, 26, 14, 0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#2C1A0E',
                border: '1.5px solid rgba(201, 168, 76, 0.4)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.25), transparent)' }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full transition-colors z-10"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <X size={18} />
              </button>

              <div className="p-8 text-center relative z-10">
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C' }}
                >
                  {info.icon}
                </div>

                {/* Crown badge */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Crown size={16} style={{ color: '#C9A84C' }} />
                  <span
                    className="text-xs font-bold tracking-widest"
                    style={{ color: '#C9A84C' }}
                  >
                    ELITE FEATURE
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#FFFFFF' }}
                >
                  {info.title}
                </h2>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,255,255,0.7)' }}
                >
                  {info.description}
                </p>

                {/* Upgrade button */}
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.05rem',
                    backgroundColor: '#C9A84C',
                    color: '#2C1A0E',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 20px rgba(201, 168, 76, 0.4)',
                  }}
                >
                  View Plans
                  <ArrowRight size={18} />
                </button>

                {/* Dismiss */}
                <button
                  onClick={onClose}
                  className="mt-4 text-sm transition-colors"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: 'rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
