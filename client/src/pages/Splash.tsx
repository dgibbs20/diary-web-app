/**
 * Splash Screen — Matches the marketing site splash exactly
 * Large logo (280px), shadow, tagline, "TAP ANYWHERE TO ENTER", warm cream bg
 * Reference: marketing site line 299-305
 */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Splash() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, isElite } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/assets/sound/notify.wav');
    audioRef.current.volume = 0.15; // Match marketing site: volume 0.15
  }, []);

  const handleInteraction = () => {
    if (hasInteracted) return;
    setHasInteracted(true);
    audioRef.current?.play().catch(() => {});

    // Match marketing site timing: 800ms delay then 1200ms fade
    setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        if (!isLoading) {
          navigate(isAuthenticated ? '/dashboard' : '/login');
        }
      }, 800);
    }, 800);
  };

  useEffect(() => {
    if (!isLoading && !showSplash) {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isLoading, showSplash, isAuthenticated, navigate]);

  const logoUrl = isElite ? '/assets/images/logo_elite.png' : '/assets/images/logo.png';

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none"
          style={{ backgroundColor: '#F5F0E8' }}
          onClick={handleInteraction}
          onKeyDown={(e) => e.key === 'Enter' && handleInteraction()}
          tabIndex={0}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          {/* Logo — large, matching marketing site height: 280px */}
          <motion.img
            src={logoUrl}
            alt="diAry"
            style={{
              height: '280px',
              filter: 'drop-shadow(0 8px 32px rgba(201,168,76,0.4))',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: [1, 1.02, 1],
            }}
            transition={{
              opacity: { duration: 0.6, ease: 'easeOut' },
              scale: { duration: 1, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
            }}
          />

          {/* Tagline — matching marketing site: 1.4rem italic */}
          <motion.p
            className="font-serif italic"
            style={{
              fontSize: '1.4rem',
              color: '#8B6347',
              letterSpacing: '0.08em',
              marginTop: '20px',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          >
            "I'll never tell."
          </motion.p>
          
          {/* Subtitle — NOW GOES RIGHT AFTER THE TAGLINE */}
          <motion.p
            className="font-serif italic"
            style={{
              fontSize: '0.82rem',
              fontWeight: 300,
              color: '#8B6347',
              letterSpacing: '0.06em',
              marginTop: '12px',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
          >
            Your private safe space awaits
          </motion.p>
          
          {/* Enter prompt — NOW GOES AFTER THE SUBTITLE */}
          <motion.p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase' as const,
              color: '#C9A84C',
              marginTop: '32px',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: hasInteracted ? 0 : [0, 1, 0] }}
            transition={
              hasInteracted
                ? { duration: 0.3 }
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }
            }
          >
            — Tap Anywhere to Enter —
          </motion.p>

          {/* Subtitle — matching marketing site: 0.82rem italic */}
          <motion.p
            className="font-serif italic"
            style={{
              fontSize: '0.82rem',
              fontWeight: 300,
              color: '#8B6347',
              letterSpacing: '0.06em',
              marginTop: '12px',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 2 }}
          >
            Your private safe space awaits
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
