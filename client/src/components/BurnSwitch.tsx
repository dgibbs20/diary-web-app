/**
 * BurnSwitch
 * ----------
 * Pill-shaped toggle that mirrors the Flutter app's `BurnSwitch` widget
 * (lib/presentation/settings/ui/widgets/burn_switch.dart) but optimised for
 * desktop and dressed in the diAry Quiet Luxury palette (gold/cream/brown).
 *
 * Visual layout:
 *   [ 🔥  Burn Mode    [▢——]  ]
 *
 * The toggle itself is a custom pill (matching the SettingsPanel/Dark Mode
 * pattern in this codebase) rather than the shadcn Switch primitive, so the
 * styling stays consistent with the rest of the app.
 *
 * Usage:
 *   <BurnSwitch value={burnMode} onChange={setBurnMode} />
 */

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const GOLD = 'var(--color-gold)';
const FONT = "'Cormorant Garamond', Georgia, serif";

interface BurnSwitchProps {
  /** Current value of the switch. */
  value: boolean;
  /** Fired when the user flips the switch. */
  onChange: (next: boolean) => void;
  /** Disable the control (e.g. while saving). */
  disabled?: boolean;
  /** Optional id, useful for label `htmlFor` association. */
  id?: string;
}

export default function BurnSwitch({
  value,
  onChange,
  disabled = false,
  id,
}: BurnSwitchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      role="group"
      aria-label="Burn Mode toggle"
      className="inline-flex items-center gap-3 px-3 py-2 rounded-full select-none"
      style={{
        background: value
          ? 'rgba(217, 119, 87, 0.10)' // warm ember tint when active
          : 'var(--muted)',
        border: `1px solid ${value ? 'rgba(217, 119, 87, 0.35)' : 'var(--border)'}`,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Flame icon — turns ember-orange when active, muted when off */}
      <Flame
        size={16}
        strokeWidth={2}
        style={{
          color: value ? '#D97757' : 'var(--muted-foreground)',
          transition: 'color 200ms ease',
        }}
        aria-hidden
      />

      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-medium tracking-wide cursor-pointer"
        style={{
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
          fontFamily: FONT,
          letterSpacing: '0.01em',
          transition: 'color 200ms ease',
        }}
      >
        Burn Mode
      </label>

      {/* Custom pill toggle — matches the SettingsPanel Dark Mode toggle pattern */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className="w-11 h-6 rounded-full relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: value ? GOLD : 'var(--border)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'background-color 250ms ease',
          // @ts-expect-error CSS custom property for ring color
          '--tw-ring-color': GOLD,
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          style={{
            left: value ? '22px' : '2px',
            transition: 'left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>
    </motion.div>
  );
}
