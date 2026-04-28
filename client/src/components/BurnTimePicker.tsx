/**
 * BurnTimePicker
 * --------------
 * Desktop-optimised burn date/time picker. Mirrors the Flutter app's
 * `_pickBurnEndTime` flow (lib/presentation/journal/ui/text_journal_screen.dart),
 * which sequentially presents `showDatePicker` and `showTimePicker` and
 * returns the combined `DateTime`.
 *
 * Desktop optimisation: instead of stacking two modals (mobile pattern),
 * we render the calendar and the time inputs side-by-side in a single
 * dialog with one Confirm button. Same input → same output, fewer clicks.
 *
 * Constraints (parity with Flutter):
 *   - firstDate = now (no past dates)
 *   - lastDate  = now + 365 days
 *   - default   = existing burn date, otherwise now + 1 day at +1h
 *
 * Returns the selected `Date` (in local time) via `onConfirm`. The caller
 * is responsible for `.toISOString()` when sending to the backend.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Flame, Clock, CalendarDays } from 'lucide-react';

const GOLD = 'var(--color-gold)';
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";

interface BurnTimePickerProps {
  open: boolean;
  /** Existing burn time when editing an entry, otherwise undefined. */
  initialValue?: Date;
  /** Called with the chosen Date when the user confirms. */
  onConfirm: (date: Date) => void;
  /** Called when the user cancels or closes the dialog. */
  onCancel: () => void;
}

/** Pad a number to two digits ('5' -> '05'). */
function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Default initial value: tomorrow at the next hour mark. */
function getDefaultInitial(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export default function BurnTimePicker({
  open,
  initialValue,
  onConfirm,
  onCancel,
}: BurnTimePickerProps) {
  // Compute date bounds once — Flutter parity: now → now+365d
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const min = new Date(now);
    min.setHours(0, 0, 0, 0);
    const max = new Date(now);
    max.setDate(max.getDate() + 365);
    return { minDate: min, maxDate: max };
  }, [open]); // recompute when the dialog re-opens so "now" stays fresh

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialValue ?? getDefaultInitial(),
  );
  const [hours, setHours] = useState<string>(() => {
    const d = initialValue ?? getDefaultInitial();
    return pad2(d.getHours());
  });
  const [minutes, setMinutes] = useState<string>(() => {
    const d = initialValue ?? getDefaultInitial();
    return pad2(d.getMinutes());
  });
  const [error, setError] = useState<string | null>(null);

  // Reset state every time the dialog re-opens with new context
  useEffect(() => {
    if (!open) return;
    const seed = initialValue ?? getDefaultInitial();
    setSelectedDate(seed);
    setHours(pad2(seed.getHours()));
    setMinutes(pad2(seed.getMinutes()));
    setError(null);
  }, [open, initialValue]);

  /** Build the combined Date from selectedDate + hours + minutes. */
  const combined = useMemo<Date | null>(() => {
    if (!selectedDate) return null;
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    const d = new Date(selectedDate);
    d.setHours(h, m, 0, 0);
    return d;
  }, [selectedDate, hours, minutes]);

  const handleConfirm = () => {
    if (!combined) {
      setError('Pick a date and a valid time.');
      return;
    }
    if (combined.getTime() <= Date.now()) {
      setError('Burn time must be in the future.');
      return;
    }
    onConfirm(combined);
  };

  // Format preview — e.g. "Burns on Oct 30, 2026 — 8:30 PM"
  const previewLabel = useMemo(() => {
    if (!combined) return '';
    const date = combined.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const time = combined.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `Burns on ${date} — ${time}`;
  }, [combined]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        className="max-w-2xl"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          fontFamily: FONT_SERIF,
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Flame size={18} style={{ color: '#D97757' }} aria-hidden />
            <DialogTitle
              style={{
                color: 'var(--foreground)',
                fontFamily: FONT_SERIF,
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}
            >
              Set Burn Time
            </DialogTitle>
          </div>
          <DialogDescription
            style={{
              color: 'var(--muted-foreground)',
              fontFamily: FONT_SERIF,
            }}
          >
            Choose when this entry should be permanently destroyed. After this
            moment passes, the entry is deleted server-side and cannot be
            recovered.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 py-2">
          {/* Date column */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={14} style={{ color: GOLD }} aria-hidden />
              <span
                className="text-xs uppercase tracking-widest"
                style={{
                  color: 'var(--muted-foreground)',
                  fontFamily: FONT_SERIF,
                  letterSpacing: '0.15em',
                }}
              >
                Date
              </span>
            </div>
            <div
              className="rounded-lg p-1"
              style={{ border: '1px solid var(--border)' }}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={[{ before: minDate }, { after: maxDate }]}
                defaultMonth={selectedDate ?? minDate}
              />
            </div>
          </div>

          {/* Time + summary column */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} style={{ color: GOLD }} aria-hidden />
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: FONT_SERIF,
                    letterSpacing: '0.15em',
                  }}
                >
                  Time
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={23}
                  step={1}
                  value={hours}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setHours(raw);
                  }}
                  onBlur={() => {
                    const h = parseInt(hours, 10);
                    if (Number.isNaN(h) || h < 0) setHours('00');
                    else if (h > 23) setHours('23');
                    else setHours(pad2(h));
                  }}
                  aria-label="Hours (24-hour)"
                  className="w-16 text-center text-2xl rounded-md py-2 focus:outline-none"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontFamily: FONT_SERIF,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
                <span
                  className="text-2xl"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  :
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  step={1}
                  value={minutes}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setMinutes(raw);
                  }}
                  onBlur={() => {
                    const m = parseInt(minutes, 10);
                    if (Number.isNaN(m) || m < 0) setMinutes('00');
                    else if (m > 59) setMinutes('59');
                    else setMinutes(pad2(m));
                  }}
                  aria-label="Minutes"
                  className="w-16 text-center text-2xl rounded-md py-2 focus:outline-none"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontFamily: FONT_SERIF,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
                <span
                  className="text-xs uppercase tracking-widest ml-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: FONT_SERIF,
                    letterSpacing: '0.15em',
                  }}
                >
                  24-hour
                </span>
              </div>
            </div>

            {/* Quick presets — desktop convenience */}
            <div>
              <span
                className="text-xs uppercase tracking-widest block mb-2"
                style={{
                  color: 'var(--muted-foreground)',
                  fontFamily: FONT_SERIF,
                  letterSpacing: '0.15em',
                }}
              >
                Quick set
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '+1 hour', ms: 60 * 60 * 1000 },
                  { label: '+24 hours', ms: 24 * 60 * 60 * 1000 },
                  { label: '+3 days', ms: 3 * 24 * 60 * 60 * 1000 },
                  { label: '+7 days', ms: 7 * 24 * 60 * 60 * 1000 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      const target = new Date(Date.now() + p.ms);
                      setSelectedDate(target);
                      setHours(pad2(target.getHours()));
                      setMinutes(pad2(target.getMinutes()));
                      setError(null);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      fontFamily: FONT_SERIF,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div
              className="mt-auto rounded-lg p-3"
              style={{
                background: 'rgba(217, 119, 87, 0.08)',
                border: '1px solid rgba(217, 119, 87, 0.25)',
              }}
            >
              <div className="flex items-start gap-2">
                <Flame
                  size={14}
                  style={{ color: '#D97757', marginTop: 2 }}
                  aria-hidden
                />
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: FONT_SERIF,
                    lineHeight: 1.4,
                  }}
                >
                  {previewLabel || 'Pick a date and time to preview.'}
                </p>
              </div>
            </div>

            {error && (
              <p
                className="text-sm"
                role="alert"
                style={{
                  color: 'var(--destructive)',
                  fontFamily: FONT_SERIF,
                }}
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            style={{ fontFamily: FONT_SERIF }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            style={{
              background: GOLD,
              color: 'var(--primary-foreground)',
              fontFamily: FONT_SERIF,
              letterSpacing: '0.02em',
            }}
          >
            Set Burn Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
