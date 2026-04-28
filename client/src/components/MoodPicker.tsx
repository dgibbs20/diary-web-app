/**
 * Mood Picker Modal — Premium desktop experience
 * 31 emotions, native emoji, search, Continue/Skip — matches mobile parity
 * Cormorant Garamond typography, gold accents, luxury spacing
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { MOOD_CONFIG } from '@/lib/constants';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';

interface MoodPickerProps {
  onSelect: (mood: string) => void;
  onClose: () => void;
}

export default function MoodPicker({ onSelect, onClose }: MoodPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const moods = useMemo(() => {
    const all = Object.entries(MOOD_CONFIG);
    if (!query.trim()) return all;
    return all.filter(([, config]) =>
      config.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl w-full mx-4"
        style={{
          maxWidth: '780px',
          backgroundColor: 'var(--card)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 24 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2
              style={{
                fontFamily: FONT,
                fontSize: '1.6rem',
                fontWeight: 400,
                letterSpacing: '0.03em',
                color: 'var(--foreground)',
                lineHeight: 1.2,
              }}
            >
              How are you feeling?
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
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 pt-5 pb-1">
          <div className="relative">
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search emotions..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              style={{
                width: '100%',
                paddingLeft: '38px',
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
        <div
          className="px-8 py-5"
          style={{ maxHeight: '360px', overflowY: 'auto' }}
        >
          <AnimatePresence mode="popLayout">
            {moods.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontFamily: FONT,
                  fontStyle: 'italic',
                  fontSize: '0.9rem',
                  padding: '40px 0',
                }}
              >
                No emotions match "{query}"
              </motion.p>
            ) : (
              <motion.div
                key="grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                  gap: '10px',
                }}
              >
                {moods.map(([key, config], i) => {
                  const isSelected = selected === key;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => setSelected(isSelected ? null : key)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.18, delay: i * 0.012 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 8px',
                        borderRadius: '14px',
                        border: isSelected
                          ? `1.5px solid ${GOLD}`
                          : '1.5px solid var(--border)',
                        background: isSelected
                          ? `rgba(201,168,76,0.08)`
                          : 'transparent',
                        boxShadow: isSelected
                          ? `0 4px 20px rgba(201,168,76,0.15)`
                          : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                        {config.emoji}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT,
                          fontSize: '0.72rem',
                          letterSpacing: '0.04em',
                          color: isSelected ? GOLD : 'var(--muted-foreground)',
                          fontWeight: isSelected ? 600 : 400,
                          textAlign: 'center',
                          lineHeight: 1.2,
                          transition: 'color 0.2s',
                        }}
                      >
                        {config.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="px-8 pb-7 pt-1 flex flex-col items-center gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={!selected}
            whileHover={selected ? { scale: 1.02 } : {}}
            whileTap={selected ? { scale: 0.98 } : {}}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: selected
                ? `linear-gradient(135deg, ${GOLD}, #b8892e)`
                : 'var(--muted)',
              color: selected ? '#fff' : 'var(--muted-foreground)',
              fontFamily: FONT,
              fontSize: '0.95rem',
              letterSpacing: '0.1em',
              fontWeight: 600,
              border: 'none',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'background 0.25s, color 0.25s',
            }}
          >
            Continue
          </motion.button>
          <button
            onClick={onClose}
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
            Skip
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
