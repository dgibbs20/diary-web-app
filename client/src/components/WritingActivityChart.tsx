/**
 * WritingActivityChart — 30-day writing activity bar chart for the Analytics tab
 * Self-contained: fetches its own data from GET /api/analytics/monthly via analyticsApi.getMonthly
 * Bar height = daily word count; bar color = mood logged that day (MOOD_CONFIG color), or a
 * muted neutral for days with entries but no mood, or a faint ghost bar for days with no entries.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { analyticsApi } from '@/lib/api';
import { MOOD_CONFIG } from '@/lib/constants';

const GOLD = '#C9A84C';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthlyStats {
  year: number;
  month: number;
  total_entries: number;
  total_words: number;
  daily_entries: Record<string, number>;
  daily_words: Record<string, number>;
  daily_moods: Record<string, string>;
  input_method_distribution: Record<string, number>;
  active_days: number;
}

interface DayDatum {
  date: string;
  day: number;
  words: number;
  displayWords: number;
  entries: number;
  mood: string | null;
}

interface WritingActivityChartProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export default function WritingActivityChart({ year, month, onMonthChange }: WritingActivityChartProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const fetchMonthly = async () => {
      try {
        const res = await analyticsApi.getMonthly(year, month);
        if (cancelled) return;
        if (res.success && res.monthly_stats) {
          setData(res.monthly_stats);
        } else {
          setData(null);
          setError('analytics_activityFailedLoad');
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setError('analytics_activityFailedLoad');
        }
      }
      if (!cancelled) setIsLoading(false);
    };
    fetchMonthly();
    return () => { cancelled = true; };
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const baseData: DayDatum[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      date: dateStr,
      day,
      words: data?.daily_words?.[dateStr] ?? 0,
      displayWords: 0,
      entries: data?.daily_entries?.[dateStr] ?? 0,
      mood: data?.daily_moods?.[dateStr] ?? null,
    };
  });
  const maxWords = Math.max(1, ...baseData.map((d) => d.words));
  const ghostHeight = maxWords * 0.04;
  const chartData: DayDatum[] = baseData.map((d) => ({
    ...d,
    displayWords: d.entries === 0 ? ghostHeight : d.words,
  }));

  const now = new Date();
  const isCurrentOrFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);

  const goToPrevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const goToNextMonth = () => {
    if (isCurrentOrFutureMonth) return;
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const hasActivity = (data?.active_days ?? 0) > 0;
  const tickInterval = Math.max(0, Math.ceil(daysInMonth / 10) - 1);

  return (
    <motion.div
      className="p-6 rounded-xl"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: GOLD }} />
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            {t('analytics_writingActivity')}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {MONTH_LABELS[month - 1]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextMonth}
              disabled={isCurrentOrFutureMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          className="h-52 rounded-lg animate-pulse"
          style={{ backgroundColor: 'var(--muted)' }}
          aria-label={t('analytics_activityLoading')}
        />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {t(error)}
          </p>
        </div>
      ) : !hasActivity ? (
        <div className="text-center py-8">
          <p
            className="text-sm italic"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {t('analytics_activityEmpty')}
          </p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip content={<ActivityTooltip t={t} />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
              <Bar dataKey="displayWords" radius={[4, 4, 0, 0]} maxBarSize={18}>
                {chartData.map((d) => {
                  const moodColor = d.mood ? MOOD_CONFIG[d.mood]?.color : null;
                  const isGhost = d.entries === 0;
                  const fill = isGhost ? 'var(--muted)' : moodColor || 'var(--muted)';
                  const fillOpacity = isGhost ? 0.25 : moodColor ? 0.9 : 0.8;
                  return <Cell key={d.date} fill={fill} fillOpacity={fillOpacity} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function ActivityTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean;
  payload?: Array<{ payload: DayDatum }>;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const dateObj = new Date(`${d.date}T00:00:00`);
  const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const moodConfig = d.mood ? MOOD_CONFIG[d.mood] : null;

  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{formatted}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
        {t('analytics_activityEntryCount', { count: d.entries })} · {t('analytics_activityWordCount', { count: d.words })}
      </p>
      {moodConfig && (
        <p className="text-xs mt-1" style={{ color: 'var(--foreground)' }}>
          {moodConfig.emoji} {t('mood_' + d.mood)}
        </p>
      )}
    </div>
  );
}
