/**
 * BurnCountdown
 * -------------
 * Live-updating "Burns in Xd Yh" / "Yh Zm" / "Zm" label. Ticks every 30
 * seconds, which is sufficient resolution for a minute-precision countdown
 * without thrashing React. When the target time is in the past, renders
 * "Burning now…".
 *
 * Used in two places:
 *   - JournalEditor (bottom indicator strip)
 *   - JournalList   (next to the entry title)
 *
 * The `compact` variant drops the "Burns in" prefix for tight UI like list
 * rows. The default (non-compact) keeps it for full-context surfaces like the
 * editor footer.
 */

import { useEffect, useState } from 'react';

const FONT = "'Cormorant Garamond', Georgia, serif";

interface BurnCountdownProps {
  /** When the entry will burn (must be a Date in the future or recent past). */
  target: Date;
  /** Strip the "Burns in" prefix — useful in tight rows. */
  compact?: boolean;
  /** Optional override for the wrapper style. */
  style?: React.CSSProperties;
}

export default function BurnCountdown({
  target,
  compact = false,
  style,
}: BurnCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = target.getTime() - now;

  if (remainingMs <= 0) {
    return (
      <span
        style={{
          fontFamily: FONT,
          letterSpacing: '0.05em',
          ...style,
        }}
      >
        Burning now…
      </span>
    );
  }

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let label: string;
  if (days >= 1) {
    label = `${days}d ${hours}h`;
  } else if (hours >= 1) {
    label = `${hours}h ${minutes}m`;
  } else {
    // Less than 1 minute renders as "0m" — explicit "<1m" feels noisy
    label = `${minutes}m`;
  }

  return (
    <span
      style={{
        fontFamily: FONT,
        letterSpacing: '0.05em',
        ...style,
      }}
    >
      {compact ? label : `Burns in ${label}`}
    </span>
  );
}
