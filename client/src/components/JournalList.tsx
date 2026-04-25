/**
 * Journal List — Entry list with search, filter, and mood-first flow
 */
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Flame, Ghost, BookOpen } from 'lucide-react';
import type { JournalEntry } from '@/pages/Dashboard';
import type { User } from '@/contexts/AuthContext';
import { MOOD_CONFIG } from '@/lib/constants';

interface JournalListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: string;
  onFilterChange: (f: string) => void;
  onEntrySelect: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  user: User | null;
  todayMood: string | null;
  onMoodClick: () => void;
}

const EMPTY_STATE_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663029844115/cw39joRvygwi83an4yvvJL/empty-state-5JDCahsvEwRmySkNZSA27u.webp';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function JournalList({
  entries, isLoading, searchQuery, onSearchChange,
  filterType, onFilterChange, onEntrySelect, onNewEntry,
  user, todayMood, onMoodClick,
}: JournalListProps) {
  const stats = user?.stats;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 lg:px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--foreground)' }}>
                {getGreeting()}, {user?.first_name || 'there'}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {stats?.current_streak ? `${stats.current_streak} day streak` : 'Start your journey today'}
                {stats?.total_entries ? ` · ${stats.total_entries} entries` : ''}
              </p>
            </div>

            {/* Today's mood */}
            <button
              onClick={onMoodClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent"
              title="Today's mood"
            >
              {todayMood ? (
                <>
                  <img src={MOOD_CONFIG[todayMood]?.icon} alt={todayMood} className="w-7 h-7" />
                  <span className="text-xs font-medium capitalize hidden sm:inline" style={{ color: 'var(--muted-foreground)' }}>
                    {todayMood}
                  </span>
                </>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                  How are you?
                </span>
              )}
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="all">All Entries</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
            </select>
          </div>
        </div>
      </header>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto diary-scrollbar px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img src={EMPTY_STATE_IMG} alt="" className="w-48 h-48 mx-auto rounded-xl object-cover mb-6 opacity-80" />
              <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--foreground)' }}>
                {searchQuery ? 'No entries found' : 'Your story begins here'}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                {searchQuery ? 'Try a different search term' : 'Start writing your first entry'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewEntry}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
                >
                  <Plus size={16} /> Write Your First Entry
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <motion.button
                  key={entry.id}
                  onClick={() => onEntrySelect(entry)}
                  className="w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-sm group"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -1 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Mood indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {entry.mood && MOOD_CONFIG[entry.mood] ? (
                        <img src={MOOD_CONFIG[entry.mood].icon} alt={entry.mood} className="w-6 h-6" />
                      ) : (
                        <BookOpen size={18} style={{ color: 'var(--muted-foreground)' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-base font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        {entry.burn_mode && <Flame size={14} style={{ color: '#E85D4A' }} />}
                        {entry.ghost_mode && <Ghost size={14} style={{ color: 'var(--muted-foreground)' }} />}
                      </div>
                      <p className="text-sm truncate mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                        {entry.preview || 'No content'}
                      </p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span>{formatDate(entry.created_at)}</span>
                        <span>·</span>
                        <span>{entry.word_count} words</span>
                        {entry.ai_response && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1" style={{ color: '#C9A84C' }}>
                              AI insight
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating New Entry Button (mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={onNewEntry}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
