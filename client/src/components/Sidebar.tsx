/**
 * Sidebar Rail — Premium branded navigation
 * 64px icon rail, expands to 220px on hover
 * Consistent gold/cream/brown branding
 * No logo (header handles that now)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, PenLine, Settings, BarChart3, Bot,
  LogOut, ChevronRight
} from 'lucide-react';
import type { ViewMode } from '@/pages/Dashboard';

interface SidebarProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onNewEntry: () => void;
  onToggleAi: () => void;
  showAiPanel: boolean;
}

const navItems = [
  { id: 'list' as ViewMode, icon: BookOpen, label: 'Journal' },
  { id: 'analytics' as ViewMode, icon: BarChart3, label: 'Analytics' },
  { id: 'settings' as ViewMode, icon: Settings, label: 'Settings' },
];

export default function Sidebar({ viewMode, onViewChange, onNewEntry, onToggleAi, showAiPanel }: SidebarProps) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <motion.aside
      className="h-full flex flex-col border-r relative z-20 select-none"
      style={{
        backgroundColor: 'var(--sidebar)',
        borderColor: 'var(--sidebar-border)',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      animate={{ width: expanded ? 220 : 68 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* New Entry Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
          style={{
            background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
            color: '#F5F0E8',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            letterSpacing: '0.08em',
            boxShadow: '0 2px 10px rgba(168,134,58,0.2)',
          }}
        >
          <PenLine size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm whitespace-nowrap overflow-hidden"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            NEW ENTRY
          </motion.span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 my-1" style={{ height: '1px', background: 'var(--sidebar-border)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative"
              style={{
                backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
                color: isActive ? '#C9A84C' : 'var(--sidebar-foreground)',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ backgroundColor: '#C9A84C' }}
                />
              )}
              <item.icon size={18} className="flex-shrink-0" />
              <motion.span
                className="text-sm font-semibold tracking-wide whitespace-nowrap overflow-hidden"
                animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}

        {/* AI Companion toggle */}
        <button
          onClick={onToggleAi}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: showAiPanel ? 'var(--sidebar-accent)' : 'transparent',
            color: showAiPanel ? '#C9A84C' : 'var(--sidebar-foreground)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          <Bot size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm font-semibold tracking-wide whitespace-nowrap overflow-hidden"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            AI Companion
          </motion.span>
          {expanded && (
            <ChevronRight
              size={14}
              className="ml-auto flex-shrink-0 transition-transform duration-200"
              style={{ transform: showAiPanel ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </button>
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
              color: '#F5F0E8',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
            }}
          >
            {user?.first_name?.[0] || user?.fullname?.[0] || 'U'}
          </div>
          <motion.div
            className="overflow-hidden whitespace-nowrap"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--sidebar-foreground)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {user?.first_name || user?.fullname || 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {user?.email}
            </p>
          </motion.div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 hover:bg-accent"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            Sign Out
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
