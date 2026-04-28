/**
 * Analytics Panel — Premium branded stats, mood tracking, writing activity
 * Consistent Cormorant Garamond typography, gold accents throughout
 * Maps to backend nested response: { stats: { writing_streak, entries, writing, mood, account, ai_reflection } }
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BookOpen, PenLine, Flame, Award, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/api';
import { MOOD_CONFIG } from '@/lib/constants';
import { Streamdown } from 'streamdown';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

// Random positive messages, affirmations & quotes
const POSITIVE_MESSAGES = [
  "You're doing amazing. Keep going.",
  "Every entry is a step towards knowing yourself better.",
  "Your thoughts matter. Your words matter.",
  "Progress, not perfection.",
  "You've got this.",
  "Be proud of the effort you're making.",
  "Your journey is unique and beautiful.",
  "Keep shining like the star you are.",
  "You are worthy of your own love and respect.",
  "Today is a great day to reflect and grow.",
  "Your words have power.",
  "You are stronger than you think.",
  "Celebrate the small victories.",
  "Your voice deserves to be heard.",
  "You are enough, just as you are.",
  "Every day is a fresh start.",
  "Trust the process. You're getting there.",
  "Your dedication is inspiring.",
  "You're creating something meaningful.",
  "Remember why you started.",
];

interface BackendStats {
  writing_streak: { current_streak: number; days_since_last_entry: number };
  entries: { total_entries: number; entries_this_month: number; most_used_method: string };
  writing: { total_words: number; avg_words_per_entry: number };
  mood: {
    most_common_mood_30days: string | null;
    mood_entries_30days: number;
    mood_distribution_30days: Record<string, number>;
  };
  account: { member_since: string; last_login: string | null };
  ai_reflection?: string;
}

export default function AnalyticsPanel() {
  const { user } = useAuth();
  const [data, setData] = useState<BackendStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyMessage, setDailyMessage] = useState('');

  useEffect(() => {
    // Get random positive message on mount
    const randomMessage = POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
    setDailyMessage(randomMessage);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getStats();
        if (res.success && res.stats) {
          setData(res.stats);
        } else {
          setError(res.error?.message || 'Failed to load analytics');
        }
      } catch (e) {
        setError('Unable to connect to analytics service');
      }
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Flatten the nested backend data for display
  const totalEntries = data?.entries?.total_entries ?? user?.stats?.total_entries ?? 0;
  const totalWords = data?.writing?.total_words ?? user?.stats?.total_words ?? 0;
  const currentStreak = data?.writing_streak?.current_streak ?? user?.stats?.current_streak ?? 0;
  const entriesThisMonth = data?.entries?.entries_this_month ?? 0;
  const avgWords = data?.writing?.avg_words_per_entry ?? (totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0);
  const daysSinceLastEntry = data?.writing_streak?.days_since_last_entry ?? 0;
  const memberSince = data?.account?.member_since ?? '';
  const moodDistribution = data?.mood?.mood_distribution_30days ?? {};
  const aiReflection = data?.ai_reflection ?? '';

  const statCards = [
    { icon: BookOpen, label: 'Total Entries', value: totalEntries, color: GOLD },
    { icon: PenLine, label: 'Total Words', value: totalWords.toLocaleString(), color: GOLD_DARK },
    { icon: Flame, label: 'Current Streak', value: `${currentStreak} days`, color: '#E85D4A' },
    { icon: Calendar, label: 'This Month', value: entriesThisMonth, color: '#6B8EC2' },
    { icon: TrendingUp, label: 'Avg Words/Entry', value: avgWords, color: '#8BC34A' },
    { icon: Award, label: 'Days Since Last', value: daysSinceLastEntry === 0 ? 'Today!' : `${daysSinceLastEntry} days`, color: GOLD },
  ];

  const moodEntries = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moodEntries.length > 0 ? moodEntries[0][1] : 1;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <header className="px-6 lg:px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <BarChart3 size={20} style={{ color: GOLD }} />
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: FONT, color: 'var(--foreground)', letterSpacing: '0.02em' }}
            >
              Analytics
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
            >
              Your journaling journey at a glance
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto diary-scrollbar px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Daily Affirmation */}
          {dailyMessage && (
            <motion.div
              className="p-6 rounded-xl text-center"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--card)',
                borderColor: `${GOLD}40`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center mb-3">
                <img 
                  src="/assets/images/logo.png" 
                  alt="diAry" 
                  style={{ height: '24px', width: 'auto' }} 
                />
              </div>
              <p
                className="text-lg italic"
                style={{
                  fontFamily: FONT,
                  color: 'var(--foreground)',
                  letterSpacing: '0.02em',
                  fontWeight: 300,
                }}
              >
                {dailyMessage}
              </p>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <BarChart3 size={40} className="mx-auto mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{error}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', fontFamily: FONT, opacity: 0.7 }}>
                Showing cached data from your profile
              </p>
              {/* Still show stat cards from user profile fallback */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {statCards.map((card, idx) => (
                  <StatCard key={card.label} card={card} idx={idx} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card, idx) => (
                  <StatCard key={card.label} card={card} idx={idx} />
                ))}
              </div>

              {/* AI Reflection */}
              {aiReflection && (
                <motion.div
                  className="p-6 rounded-xl"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} style={{ color: GOLD }} />
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: FONT, color: 'var(--foreground)' }}
                    >
                      AI Reflection
                    </h3>
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--foreground)', fontFamily: FONT, opacity: 0.9 }}
                  >
                    <Streamdown>{aiReflection}</Streamdown>
                  </div>
                </motion.div>
              )}

              {/* Mood Distribution */}
              {moodEntries.length > 0 && (
                <motion.div
                  className="p-6 rounded-xl"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3
                    className="text-lg mb-4 font-semibold"
                    style={{ fontFamily: FONT, color: 'var(--foreground)' }}
                  >
                    Mood Distribution (Last 30 Days)
                  </h3>
                  <div className="space-y-3">
                    {moodEntries.map(([moodKey, count]) => {
                      const config = MOOD_CONFIG[moodKey];
                      if (!config) return null;
                      return (
                        <div key={moodKey} className="flex items-center gap-3">
                          <span style={{ fontSize: "1.2rem", lineHeight: 1, flexShrink: 0 }}>{config.emoji}</span>
                          <span
                            className="text-sm w-20 capitalize font-medium"
                            style={{ color: 'var(--foreground)', fontFamily: FONT }}
                          >
                            {config.label}
                          </span>
                          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: config.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / maxMoodCount) * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                            />
                          </div>
                          <span
                            className="text-xs tabular-nums w-8 text-right font-semibold"
                            style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                          >
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Member since */}
              <div className="text-center py-4">
                <p
                  className="text-xs tracking-wider uppercase font-semibold"
                  style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                >
                  Member since {memberSince || 'the beginning'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ card, idx }: { card: { icon: React.ElementType; label: string; value: string | number; color: string }; idx: number }) {
  return (
    <motion.div
      className="p-4 rounded-xl"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <card.icon size={16} style={{ color: card.color }} />
        <span
          className="text-xs tracking-wider uppercase"
          style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontWeight: 600 }}
        >
          {card.label}
        </span>
      </div>
      <p
        className="text-2xl font-semibold"
        style={{ fontFamily: FONT, color: 'var(--foreground)' }}
      >
        {card.value}
      </p>
    </motion.div>
  );
}
