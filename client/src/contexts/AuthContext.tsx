import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setTokens, getTokens, clearTokens, userApi } from '@/lib/api';

export interface UserPreferences {
  ai_mode: string;
  auto_save: boolean;
  handwriting_enabled: boolean;
  line_style: string;
  notifications_enabled: boolean;
  page_flip_sound: boolean;
  privacy_mode: boolean;
  theme: string;
  voice_enabled: boolean;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_entries: number;
  total_words: number;
  member_since: string;
  last_entry?: {
    title: string;
    date: string;
  };
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  fullname: string;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  preferences: UserPreferences;
  stats: UserStats;
  subscription_tier: string;
  subscription_expires: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isElite: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>;
  register: (email: string, password: string, fullname: string, username?: string) => Promise<{ success: boolean; error?: string; email?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isElite = user?.subscription_tier === 'diary_elite';

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // silent fail
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        setTokens(res.access_token, res.refresh_token, res.exp);
        setUser(res.user);
        return { success: true };
      }
      if (res.error?.code === 'OTP_REQUIRED' || res.otp_required) {
        return { success: false, needsVerification: true, email };
      }
      return { success: false, error: res.error?.message || res.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email: string, password: string, fullname: string, username?: string) => {
    try {
      const res = await authApi.register(email, password, fullname, username);
      if (res.success) {
        return { success: true, email: res.email || email };
      }
      return { success: false, error: res.error?.message || res.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    clearTokens();
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isElite,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
