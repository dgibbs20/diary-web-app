/**
 * LoginOnboardingFlow
 * -------------------
 * Two-step modal sequence that fires once per day on first login:
 *
 *   Step 1 — Mood check-in   (reuses existing MoodPicker UI patterns)
 *   Step 2 — Intent prompt   ("Would you like to Journal or Chat?")
 *
 * Controlled entirely by Dashboard. Once the user completes or dismisses,
 * Dashboard marks the session so it never re-shows on the same login.
 *
 * Props:
 *   onJournal()  — user chose to write a journal entry
 *   onChat()     — user chose to open the AI companion
 *   onDismiss()  — user skipped / closed without choosing
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, MessageCircle, Sparkles } from 'lucide-react';
import { MOOD_CONFIG } from '@/lib/constants';
import { moodApi } from '@/lib/api';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DIM = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.30)';

type Step = 'mood' | 'intent';

interface LoginOnboardingFlowProps {
  onJournal: (mood: string) => void;
  onChat: (mood: string) => void;
  onDismiss: () => void;
}

export default function LoginOnboardingFlow({
  onJournal,
  onChat,
  onDismiss,
}: LoginOnboardingFlowProps) {
  const [step, setStep] = useState<Step>('mood');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<string>('');
  const [query, setQuery] = useState('');

  // ── Step 1: mood selected → save to backend → advance to intent ──
  const handleMoodContinue = async () => {
    if (!selectedMood) return;
    try {
      await moodApi.saveMood(selectedMood);
    } catch { /* silent — mood save is best-effort */ }
    setSavedMood(selectedMood);
    setStep('intent');
  };

  const handleSkipMood = () => {
    // Skip mood but still show intent prompt
    setSavedMood('');
    setStep('intent');
  };

  // ── Step 2: intent chosen ──
  const handleJournal = () => onJournal(savedMood);
  const handleChat = () => onChat(savedMood);

  // Filter moods by search query
  const moods = Object.entries(MOOD_CONFIG).filter(([, config]) =>
    !query.trim() || config.label.toLowerCase().includes(query.toLowerCase())
  );

  const moodLabel = savedMood && MOOD_CONFIG[savedMood as keyof typeof MOOD_CONFIG]
    ? MOOD_CONFIG[savedMood as keyof typeof MOOD_CONFIG].label
    : '';
  const moodEmoji = savedMood && MOOD_CONFIG[savedMood as keyof typeof MOOD_CONFIG]
    ? MOOD_CONFIG[savedMood as keyof typeof MOOD_CONFIG].emoji
    : '';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <AnimatePresence mode="wait">

        {/* ─── STEP 1: Mood Check-in ─── */}
        {step === 'mood' && (
          <motion.div
            key="mood"
            className="rounded-2xl w-full mx-4"
            style={{
              maxWidth: '780px',
              backgroundColor: 'var(--card)',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 pt-8 pb-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <p style={{
                  fontFamily: FONT,
                  fontSize: '0.75rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: GOLD,
                  marginBottom: '6px',
                  fontWeight: 600,
                }}>
                  Welcome back
                </p>
                <h2 style={{
                  fontFamily: FONT,
                  fontSize: '1.6rem',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  color: 'var(--foreground)',
                  lineHeight: 1.2,
                }}>
                  How are you feeling today?
                </h2>
                <p style={{
                  fontFamily: FONT,
                  fontSize: '0.82rem',
                  color: 'var(--muted-foreground)',
                  marginTop: '4px',
                  fontStyle: 'italic',
                  letterSpacing: '0.04em',
                }}>
                  Your mood helps your AI companion understand you better
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-8 pt-5 pb-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search emotions..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedMood(null); }}
                  style={{
                    width: '100%',
                    paddingLeft: '14px',
                    paddingRight: '14px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    fontFamily: FONT,
                    fontSize: '0.88rem',
                    letterSpacing: '0.02em',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Emotion Grid */}
            <div className="px-8 py-5" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                gap: '10px',
              }}>
                {moods.map(([key, config]) => {
                  const isSelected = selectedMood === key;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => setSelectedMood(isSelected ? null : key)}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 8px',
                        borderRadius: '14px',
                        border: isSelected ? `1.5px solid ${GOLD}` : '1.5px solid var(--border)',
                        background: isSelected ? GOLD_DIM : 'transparent',
                        boxShadow: isSelected ? `0 4px 20px rgba(201,168,76,0.15)` : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{config.emoji}</span>
                      <span style={{
                        fontFamily: FONT,
                        fontSize: '0.72rem',
                        letterSpacing: '0.04em',
                        color: isSelected ? GOLD : 'var(--muted-foreground)',
                        fontWeight: isSelected ? 600 : 400,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        transition: 'color 0.2s',
                      }}>
                        {config.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 pb-7 pt-4 flex flex-col items-center gap-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <motion.button
                onClick={handleMoodContinue}
                disabled={!selectedMood}
                whileHover={selectedMood ? { scale: 1.02 } : {}}
                whileTap={selectedMood ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: selectedMood
                    ? `linear-gradient(135deg, ${GOLD}, #b8892e)`
                    : 'var(--muted)',
                  color: selectedMood ? '#fff' : 'var(--muted-foreground)',
                  fontFamily: FONT,
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  border: 'none',
                  cursor: selectedMood ? 'pointer' : 'not-allowed',
                  transition: 'background 0.25s, color 0.25s',
                }}
              >
                Continue
              </motion.button>
              <button
                onClick={handleSkipMood}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: FONT,
                  fontSize: '0.8rem',
                  color: 'var(--muted-foreground)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: Journal or Chat? ─── */}
        {step === 'intent' && (
          <motion.div
            key="intent"
            className="rounded-2xl w-full mx-4"
            style={{
              maxWidth: '520px',
              backgroundColor: 'var(--card)',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 pt-8 pb-6"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                {moodEmoji && moodLabel && (
                  <p style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: GOLD,
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span>{moodEmoji}</span>
                    <span>Feeling {moodLabel}</span>
                  </p>
                )}
                <h2 style={{
                  fontFamily: FONT,
                  fontSize: '1.55rem',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  color: 'var(--foreground)',
                  lineHeight: 1.25,
                }}>
                  What would you like to do?
                </h2>
                <p style={{
                  fontFamily: FONT,
                  fontSize: '0.82rem',
                  color: 'var(--muted-foreground)',
                  marginTop: '5px',
                  fontStyle: 'italic',
                  letterSpacing: '0.03em',
                }}>
                  Your space, your choice
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Choice Cards */}
            <div className="p-8 flex flex-col gap-4">

              {/* Journal */}
              <motion.button
                onClick={handleJournal}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '22px 24px',
                  borderRadius: '16px',
                  border: `1.5px solid ${GOLD_BORDER}`,
                  background: GOLD_DIM,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.18)';
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(201,168,76,0.18)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = GOLD_DIM;
                  e.currentTarget.style.borderColor = GOLD_BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${GOLD}, #b8892e)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <BookOpen size={24} color="#fff" />
                </div>
                <div>
                  <p style={{
                    fontFamily: FONT,
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    letterSpacing: '0.03em',
                    marginBottom: '3px',
                  }}>
                    Write in my journal
                  </p>
                  <p style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: 'var(--muted-foreground)',
                    fontStyle: 'italic',
                    letterSpacing: '0.02em',
                  }}>
                    Capture your thoughts, memories, and reflections
                  </p>
                </div>
              </motion.button>

              {/* Chat */}
              <motion.button
                onClick={handleChat}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '22px 24px',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)';
                  e.currentTarget.style.borderColor = 'var(--foreground)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'var(--muted)',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MessageCircle size={24} color="var(--foreground)" />
                </div>
                <div>
                  <p style={{
                    fontFamily: FONT,
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    letterSpacing: '0.03em',
                    marginBottom: '3px',
                  }}>
                    Chat with my AI companion
                  </p>
                  <p style={{
                    fontFamily: FONT,
                    fontSize: '0.8rem',
                    color: 'var(--muted-foreground)',
                    fontStyle: 'italic',
                    letterSpacing: '0.02em',
                  }}>
                    Talk through what's on your mind
                  </p>
                </div>
              </motion.button>

            </div>

            {/* Footer */}
            <div className="px-8 pb-7 flex justify-center">
              <button
                onClick={onDismiss}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: FONT,
                  fontSize: '0.78rem',
                  color: 'var(--muted-foreground)',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={12} />
                Just browsing for now
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
