/**
 * Analytics Panel — Stats, mood tracking, writing activity
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BookOpen, PenLine, Flame, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/api';
import { MOOD_CONFIG } from '@/lib/constants';

interface AnalyticsData {
  total_entries: number;
  total_words: number;
  current_streak: number;
  longest_streak: number;
  entries_this_month: number;
  avg_words_per_entry: number;
  mood_distribution: Record<string, number>;
  weekly_activity: number[];
  most_active_day: string;
  member_since: string;
}

export default function AnalyticsPanel() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getStats();
        if (res.success) {
          setData(res.stats || res);
        }
      } catch { /* silent */ }
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Fallback to user stats if API doesn't return full analytics
  const stats = data || {
    total_entries: user?.stats?.total_entries || 0,
    total_words: user?.stats?.total_words || 0,
    current_streak: user?.stats?.current_streak || 0,
    longest_streak: user?.stats?.longest_streak || 0,
    entries_this_month: 0,
    avg_words_per_entry: user?.stats?.total_words && user?.stats?.total_entries
      ? Math.round(user.stats.total_words / user.stats.total_entries) : 0,
    mood_distribution: {},
    weekly_activity: [0, 0, 0, 0, 0, 0, 0],
    most_active_day: 'N/A',
    member_since: user?.created_at || '',
  };

  const statCards = [
    { icon: BookOpen, label: 'Total Entries', value: stats.total_entries, color: '#C9A84C' },
    { icon: PenLine, label: 'Total Words', value: stats.total_words?.toLocaleString(), color: '#A8863A' },
    { icon: Flame, label: 'Current Streak', value: `${stats.current_streak} days`, color: '#E85D4A' },
    { icon: Award, label: 'Longest Streak', value: `${stats.longest_streak} days`, color: '#C9A84C' },
    { icon: Calendar, label: 'This Month', value: stats.entries_this_month, color: '#6B8EC2' },
    { icon: TrendingUp, label: 'Avg Words/Entry', value: stats.avg_words_per_entry, color: '#8BC34A' },
  ];

  const moodEntries = Object.entries(stats.mood_distribution || {}).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moodEntries.length > 0 ? moodEntries[0][1] : 1;

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 lg:px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--foreground)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Your journaling journey at a glance
        </p>
      </header>

      <div className="flex-1 overflow-y-auto diary-scrollbar px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
              ))}
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card, idx) => (
                  <motion.div
                    key={card.label}
                    className="p-4 rounded-xl border"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <card.icon size={16} style={{ color: card.color }} />
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{card.label}</span>
                    </div>
                    <p className="text-2xl font-serif" style={{ color: 'var(--foreground)' }}>{card.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Activity */}
              <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <h3 className="font-serif text-lg mb-4" style={{ color: 'var(--foreground)' }}>Weekly Activity</h3>
                <div className="flex items-end gap-2 h-32">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const value = stats.weekly_activity?.[i] || 0;
                    const maxVal = Math.max(...(stats.weekly_activity || [1]));
                    const height = maxVal > 0 ? (value / maxVal) * 100 : 0;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md transition-all" style={{
                          height: `${Math.max(height, 4)}%`,
                          background: value > 0 ? 'linear-gradient(to top, #A8863A, #C9A84C)' : 'var(--muted)',
                        }} />
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mood Distribution */}
              {moodEntries.length > 0 && (
                <div className="p-6 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                  <h3 className="font-serif text-lg mb-4" style={{ color: 'var(--foreground)' }}>Mood Distribution</h3>
                  <div className="space-y-3">
                    {moodEntries.map(([moodKey, count]) => {
                      const config = MOOD_CONFIG[moodKey];
                      if (!config) return null;
                      return (
                        <div key={moodKey} className="flex items-center gap-3">
                          <img src={config.icon} alt={config.label} className="w-6 h-6 flex-shrink-0" />
                          <span className="text-sm w-20 capitalize" style={{ color: 'var(--foreground)' }}>{config.label}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${(count / maxMoodCount) * 100}%`,
                              backgroundColor: config.color,
                            }} />
                          </div>
                          <span className="text-xs tabular-nums w-8 text-right" style={{ color: 'var(--muted-foreground)' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Member since */}
              <div className="text-center py-4">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Member since {stats.member_since ? new Date(stats.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'the beginning'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
