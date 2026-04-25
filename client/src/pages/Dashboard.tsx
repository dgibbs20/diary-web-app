/**
 * Dashboard — Main app shell with Rail + Canvas + Drawer layout
 * "Quiet Luxury" design: warm surfaces, contextual gold, breathing whitespace
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import JournalList from '@/components/JournalList';
import JournalEditor from '@/components/JournalEditor';
import AiCompanion from '@/components/AiCompanion';
import SettingsPanel from '@/components/SettingsPanel';
import MoodPicker from '@/components/MoodPicker';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { journalApi, moodApi } from '@/lib/api';
import { toast } from 'sonner';

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  preview: string;
  word_count: number;
  mood: string | null;
  emotions: Record<string, number>;
  sentiment_score: number | null;
  ai_mode: string;
  ai_response: string | null;
  input_method: string;
  page_style: string;
  burn_mode: boolean;
  ghost_mode: boolean;
  burn_date?: string;
  has_audio: boolean;
  has_images: boolean;
  has_handwriting: boolean;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'list' | 'editor' | 'settings' | 'analytics';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [pendingMoodForEntry, setPendingMoodForEntry] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await journalApi.getEntries();
      if (res.success) {
        setEntries(res.entries || []);
      }
    } catch {
      toast.error('Failed to load entries');
    }
    setIsLoadingEntries(false);
  }, []);

  // Fetch today's mood
  const fetchTodayMood = useCallback(async () => {
    try {
      const res = await moodApi.getTodayMood();
      if (res.success && res.mood_entry) {
        setTodayMood(res.mood_entry.mood);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
      fetchTodayMood();
    }
  }, [isAuthenticated, fetchEntries, fetchTodayMood]);

  // Create new entry (mood-first flow)
  const handleNewEntry = () => {
    if (!todayMood) {
      setShowMoodPicker(true);
    } else {
      createNewEntry(todayMood);
    }
  };

  const handleMoodSelected = async (mood: string) => {
    setShowMoodPicker(false);
    setTodayMood(mood);
    try {
      await moodApi.saveMood(mood);
    } catch { /* silent */ }
    createNewEntry(mood);
  };

  const createNewEntry = (mood: string) => {
    setPendingMoodForEntry(mood);
    setSelectedEntry(null);
    setViewMode('editor');
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewMode('editor');
  };

  const handleEntrySaved = (entry: JournalEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      }
      return [entry, ...prev];
    });
    setSelectedEntry(entry);
    setPendingMoodForEntry(null);
  };

  const handleEntryDeleted = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setSelectedEntry(null);
    setViewMode('list');
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
    setViewMode('list');
    setPendingMoodForEntry(null);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.input_method === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="text-center">
          <img src="/manus-storage/logo_c40e17b6.png" alt="diAry" className="h-12 w-auto mx-auto mb-4 animate-pulse" />
          <p className="text-sm" style={{ color: '#8B6347' }}>Loading your space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar Rail */}
      <Sidebar
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewEntry={handleNewEntry}
        onToggleAi={() => setShowAiPanel(!showAiPanel)}
        showAiPanel={showAiPanel}
      />

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <JournalList
                entries={filteredEntries}
                isLoading={isLoadingEntries}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterType={filterType}
                onFilterChange={setFilterType}
                onEntrySelect={handleEntrySelect}
                onNewEntry={handleNewEntry}
                user={user}
                todayMood={todayMood}
                onMoodClick={() => setShowMoodPicker(true)}
              />
            </motion.div>
          )}

          {viewMode === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <JournalEditor
                entry={selectedEntry}
                pendingMood={pendingMoodForEntry}
                onSave={handleEntrySaved}
                onDelete={handleEntryDeleted}
                onBack={handleBackToList}
                onToggleAi={() => setShowAiPanel(!showAiPanel)}
              />
            </motion.div>
          )}

          {viewMode === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <SettingsPanel />
            </motion.div>
          )}

          {viewMode === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <AnalyticsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Companion Drawer */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="h-full border-l overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <AiCompanion
              entryContext={selectedEntry?.content}
              onClose={() => setShowAiPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Picker Modal */}
      <AnimatePresence>
        {showMoodPicker && (
          <MoodPicker
            onSelect={handleMoodSelected}
            onClose={() => setShowMoodPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
