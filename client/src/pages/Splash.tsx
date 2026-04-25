/**
 * Splash Screen — "Quiet Luxury" aesthetic
 * Plays notify.wav, shows tier-based logo, fades to auth or dashboard
 */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const LOGO_URL = '/manus-storage/logo_c40e17b6.png';
const LOGO_ELITE_URL = '/manus-storage/logo_elite_45e7c91a.png';
const SHADOW_URL = '/manus-storage/shadow_1e32d072.png';
const NOTIFY_URL = '/manus-storage/notify_91bbce90.wav';

export default function Splash() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, isElite } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFY_URL);
    audioRef.current.volume = 0.5;
  }, []);

  const handleInteraction = () => {
    if (hasInteracted) return;
    setHasInteracted(true);

    // Play sound
    audioRef.current?.play().catch(() => {});

    // Fade out after delay
    setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        if (!isLoading) {
          navigate(isAuthenticated ? '/dashboard' : '/login');
        }
      }, 600);
    }, 1800);
  };

  // If auth is still loading, wait
  useEffect(() => {
    if (!isLoading && !showSplash) {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isLoading, showSplash, isAuthenticated, navigate]);

  const logoUrl = isElite ? LOGO_ELITE_URL : LOGO_URL;

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream cursor-pointer select-none"
          style={{ backgroundColor: '#F5F0E8' }}
          onClick={handleInteraction}
          onKeyDown={(e) => e.key === 'Enter' && handleInteraction()}
          tabIndex={0}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 65%)',
            }}
          />

          {/* Logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <img
              src={logoUrl}
              alt="diAry"
              className="h-28 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.15))' }}
            />
            <img
              src={SHADOW_URL}
              alt=""
              className="mt-2 w-48 opacity-40"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="mt-8 font-serif italic text-lg tracking-wide"
            style={{ color: '#5C3D2A' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            "I'll never tell..."
          </motion.p>

          {/* Tap instruction */}
          <motion.p
            className="mt-12 text-xs tracking-[0.3em] uppercase"
            style={{ color: '#8B6347' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: hasInteracted ? 0 : [0, 0.7, 0] }}
            transition={hasInteracted ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            — Click Anywhere to Enter —
          </motion.p>

          <motion.p
            className="mt-3 text-xs tracking-wide"
            style={{ color: '#8B6347' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Your private space awaits
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
