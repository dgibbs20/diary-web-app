/**
 * Sidebar Rail — Quiet Luxury design
 * 64px icon rail, expands to 220px on hover
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, PenLine, Settings, BarChart3, Bot,
  LogOut, Crown, ChevronRight
} from 'lucide-react';
import type { ViewMode } from '@/pages/Dashboard';

const LOGO_URL = '/manus-storage/logo_c40e17b6.png';
const LOGO_ELITE_URL = '/manus-storage/logo_elite_45e7c91a.png';

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
  const { user, isElite, logout } = useAuth();
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
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <img
          src={isElite ? LOGO_ELITE_URL : LOGO_URL}
          alt="diAry"
          className="h-8 w-8 object-contain flex-shrink-0"
        />
        <motion.span
          className="ml-3 font-serif text-lg font-light whitespace-nowrap overflow-hidden"
          style={{ color: 'var(--sidebar-foreground)' }}
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
          transition={{ duration: 0.15 }}
        >
          di<span className="italic">A</span>ry
        </motion.span>
        {isElite && expanded && (
          <span className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
            <Crown size={10} /> Elite
          </span>
        )}
      </div>

      {/* New Entry Button */}
      <div className="px-3 mt-4 mb-2">
        <button
          onClick={onNewEntry}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
          style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
        >
          <PenLine size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            New Entry
          </motion.span>
        </button>
      </div>

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
                className="text-sm whitespace-nowrap overflow-hidden"
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
          }}
        >
          <Bot size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm whitespace-nowrap overflow-hidden"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            AI Companion
          </motion.span>
          {expanded && (
            <ChevronRight size={14} className="ml-auto flex-shrink-0" style={{ transform: showAiPanel ? 'rotate(180deg)' : 'none' }} />
          )}
        </button>
      </nav>

      {/* User section */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium"
            style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}>
            {user?.first_name?.[0] || user?.fullname?.[0] || 'U'}
          </div>
          <motion.div
            className="overflow-hidden whitespace-nowrap"
            animate={{ opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-foreground)' }}>
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
          style={{ color: 'var(--muted-foreground)' }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <motion.span
            className="text-sm whitespace-nowrap overflow-hidden"
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
