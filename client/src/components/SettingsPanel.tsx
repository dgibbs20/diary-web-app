/**
 * Settings Panel — Profile, preferences, password, export, dark mode
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Download, Moon, Sun, Crown, Eye, EyeOff, Loader2, Check, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { userApi, exportApi } from '@/lib/api';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'preferences' | 'security' | 'export';

export default function SettingsPanel() {
  const { user, isElite, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, icon: User, label: 'Profile' },
    { id: 'preferences' as SettingsTab, icon: Moon, label: 'Preferences' },
    { id: 'security' as SettingsTab, icon: Lock, label: 'Security' },
    { id: 'export' as SettingsTab, icon: Download, label: 'Export' },
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="px-6 lg:px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--foreground)' }}>Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto diary-scrollbar">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-6">
          {/* Tab navigation */}
          <div className="flex gap-1 p-1 rounded-lg mb-8" style={{ background: 'var(--muted)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--card)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'preferences' && <PreferencesSection theme={theme} toggleTheme={toggleTheme} />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'export' && <ExportSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userApi.updateProfile({ first_name: firstName, last_name: lastName, username, bio });
      if (res.success) {
        toast.success('Profile updated');
        refreshUser();
      } else {
        toast.error(res.error?.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Subscription badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif"
          style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}>
          {user?.first_name?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>{user?.fullname}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
        </div>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
          <Crown size={12} /> {user?.subscription_tier === 'diary_elite' ? 'Elite' : 'Free'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputClass} resize-none`} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder="Tell us about yourself..." />
      </div>

      <button onClick={handleSave} disabled={isSaving}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}>
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
          <p className="text-xl font-serif" style={{ color: '#C9A84C' }}>{user?.stats?.total_entries || 0}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Entries</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
          <p className="text-xl font-serif" style={{ color: '#C9A84C' }}>{user?.stats?.current_streak || 0}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Day Streak</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
          <p className="text-xl font-serif" style={{ color: '#C9A84C' }}>{user?.stats?.total_words || 0}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Words</p>
        </div>
      </div>
    </motion.div>
  );
}

function PreferencesSection({ theme, toggleTheme }: { theme: string; toggleTheme?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Theme toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={18} style={{ color: '#C9A84C' }} /> : <Sun size={18} style={{ color: '#C9A84C' }} />}
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Switch between light and dark themes</p>
          </div>
        </div>
        <button
          onClick={() => toggleTheme?.()}
          className="w-12 h-7 rounded-full relative transition-colors duration-300"
          style={{ backgroundColor: theme === 'dark' ? '#C9A84C' : 'var(--border)' }}
        >
          <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{ transform: theme === 'dark' ? 'translateX(22px)' : 'translateX(2px)' }} />
        </button>
      </div>

      {/* Mobile-only features */}
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Mobile-Only Features</p>
        </div>
        <div className="space-y-2">
          {['Voice Recording', 'Handwriting OCR', 'Biometric Auth', 'ICE Cam Security'].map(f => (
            <div key={f} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{f}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>Mobile</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePw = async () => {
    if (!currentPw || !newPw) { toast.error('Please fill in all fields'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setIsSaving(true);
    try {
      const res = await userApi.changePassword(currentPw, newPw);
      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        toast.error(res.error?.message || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    }
    setIsSaving(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h3 className="font-serif text-lg" style={{ color: 'var(--foreground)' }}>Change Password</h3>

      <div>
        <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Current Password</label>
        <div className="relative">
          <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
            className={`${inputClass} pr-10`} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>New Password</label>
        <div className="relative">
          <input type={showNew ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)}
            className={`${inputClass} pr-10`} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)' }}>Confirm New Password</label>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          className={inputClass} style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} />
      </div>

      <button onClick={handleChangePw} disabled={isSaving}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}>
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
        {isSaving ? 'Changing...' : 'Change Password'}
      </button>
    </motion.div>
  );
}

function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportApi.exportPdf();
      if (res.success) {
        toast.success('PDF exported successfully');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch {
      toast.error('Export failed');
    }
    setIsExporting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="p-6 rounded-xl border text-center" style={{ borderColor: 'var(--border)' }}>
        <Download size={32} className="mx-auto mb-3" style={{ color: '#C9A84C' }} />
        <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--foreground)' }}>Export Your Journal</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Download all your entries as a beautifully formatted PDF
        </p>
        <button onClick={handleExport} disabled={isExporting}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 mx-auto disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}>
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
      </div>
    </motion.div>
  );
}
