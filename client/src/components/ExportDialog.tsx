/**
 * ExportDialog — Luxury delivery method selector
 * Cormorant Garamond, gold #C9A84C, framer-motion — matches MoodPicker style
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileDown, Mail } from 'lucide-react';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (delivery: 'download' | 'email') => void;
  isExporting: boolean;
  userEmail: string;
  mode: 'entry' | 'all';
}

export default function ExportDialog({
  isOpen,
  onClose,
  onConfirm,
  isExporting,
  userEmail,
  mode,
}: ExportDialogProps) {
  const [selected, setSelected] = useState<'download' | 'email' | null>(null);

  const subtitle =
    mode === 'entry'
      ? 'Choose how you\u2019d like to receive this entry'
      : 'Choose how you\u2019d like to receive your journal';

  const handleConfirm = () => {
    if (selected && !isExporting) onConfirm(selected);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              maxWidth: '520px',
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
            <div
              className="flex items-center justify-between px-8 pt-8 pb-5"
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
                  Export as PDF
                </h2>
                <p
                  style={{
                    fontFamily: FONT,
                    fontSize: '0.82rem',
                    color: 'var(--muted-foreground)',
                    marginTop: '4px',
                    fontStyle: 'italic',
                    letterSpacing: '0.04em',
                  }}
                >
                  {subtitle}
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

            {/* Choice Cards */}
            <div className="px-8 py-8 flex gap-4">
              {/* Download Card */}
              <motion.button
                onClick={() => setSelected('download')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '28px 16px',
                  borderRadius: '16px',
                  border: selected === 'download'
                    ? `1.5px solid ${GOLD}`
                    : '1.5px solid var(--border)',
                  background: selected === 'download'
                    ? 'rgba(201,168,76,0.08)'
                    : 'transparent',
                  boxShadow: selected === 'download'
                    ? '0 4px 24px rgba(201,168,76,0.18)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <FileDown
                  size={28}
                  style={{
                    color: selected === 'download' ? GOLD : 'var(--muted-foreground)',
                    transition: 'color 0.2s',
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: selected === 'download' ? GOLD : 'var(--foreground)',
                      transition: 'color 0.2s',
                    }}
                  >
                    Download PDF
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: '0.75rem',
                      color: 'var(--muted-foreground)',
                      fontStyle: 'italic',
                      marginTop: '4px',
                      letterSpacing: '0.03em',
                    }}
                  >
                    Save directly to your device
                  </div>
                </div>
              </motion.button>

              {/* Email Card */}
              <motion.button
                onClick={() => setSelected('email')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '28px 16px',
                  borderRadius: '16px',
                  border: selected === 'email'
                    ? `1.5px solid ${GOLD}`
                    : '1.5px solid var(--border)',
                  background: selected === 'email'
                    ? 'rgba(201,168,76,0.08)'
                    : 'transparent',
                  boxShadow: selected === 'email'
                    ? '0 4px 24px rgba(201,168,76,0.18)'
                    : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <Mail
                  size={28}
                  style={{
                    color: selected === 'email' ? GOLD : 'var(--muted-foreground)',
                    transition: 'color 0.2s',
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: selected === 'email' ? GOLD : 'var(--foreground)',
                      transition: 'color 0.2s',
                    }}
                  >
                    Send to Email
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: '0.72rem',
                      color: GOLD,
                      marginTop: '4px',
                      letterSpacing: '0.03em',
                      opacity: 0.85,
                    }}
                  >
                    {userEmail}
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <div
              className="px-8 pb-7 pt-1 flex flex-col items-center gap-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <motion.button
                onClick={handleConfirm}
                disabled={!selected || isExporting}
                whileHover={selected && !isExporting ? { scale: 1.02 } : {}}
                whileTap={selected && !isExporting ? { scale: 0.98 } : {}}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background:
                    selected && !isExporting
                      ? `linear-gradient(135deg, ${GOLD}, #b8892e)`
                      : 'var(--muted)',
                  color: selected && !isExporting ? '#fff' : 'var(--muted-foreground)',
                  fontFamily: FONT,
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  border: 'none',
                  cursor: selected && !isExporting ? 'pointer' : 'not-allowed',
                  transition: 'background 0.25s, color 0.25s',
                }}
              >
                {isExporting ? 'Exporting\u2026' : 'Continue'}
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
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
