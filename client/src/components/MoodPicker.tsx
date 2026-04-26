/**
 * Mood Picker Modal — Premium branded: Select mood before journaling
 * Consistent Cormorant Garamond typography, gold accents
 */
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MOOD_CONFIG } from '@/lib/constants';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';

interface MoodPickerProps {
  onSelect: (mood: string) => void;
  onClose: () => void;
}

export default function MoodPicker({ onSelect, onClose }: MoodPickerProps) {
  const moods = Object.entries(MOOD_CONFIG);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="rounded-2xl p-8 max-w-md w-full mx-4"
        style={{
          backgroundColor: 'var(--card)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: FONT, color: 'var(--foreground)', letterSpacing: '0.02em' }}
          >
            How are you feeling?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {moods.map(([key, config]) => (
            <motion.button
              key={key}
              onClick={() => onSelect(key)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all group"
              style={{ backgroundColor: 'transparent' }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(201,168,76,0.06)' }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={config.icon}
                alt={config.label}
                className="w-10 h-10 transition-transform group-hover:scale-110"
              />
              <span
                className="text-xs capitalize font-semibold"
                style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
              >
                {config.label}
              </span>
            </motion.button>
          ))}
        </div>

        <p
          className="text-center text-xs mt-6 tracking-wide"
          style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
        >
          Your mood helps your AI companion understand you better
        </p>
      </motion.div>
    </motion.div>
  );
}
