/**
 * diAry API Service
 * Handles all communication with the Flask backend
 */

const API_BASE = 'https://api.diary.gmxquantum.com';

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number | null = null;

export function setTokens(access: string, refresh: string, exp?: number) {
  accessToken = access;
  refreshToken = refresh;
  tokenExpiry = exp || null;
  localStorage.setItem('diary_access_token', access);
  localStorage.setItem('diary_refresh_token', refresh);
  if (exp) localStorage.setItem('diary_token_exp', String(exp));
}

export function getTokens() {
  if (!accessToken) {
    accessToken = localStorage.getItem('diary_access_token');
    refreshToken = localStorage.getItem('diary_refresh_token');
    const exp = localStorage.getItem('diary_token_exp');
    tokenExpiry = exp ? Number(exp) : null;
  }
  return { accessToken, refreshToken, tokenExpiry };
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = null;
  localStorage.removeItem('diary_access_token');
  localStorage.removeItem('diary_refresh_token');
  localStorage.removeItem('diary_token_exp');
  localStorage.removeItem('diary_user');
}

function isTokenExpired(): boolean {
  if (!tokenExpiry) return false;
  return Date.now() / 1000 > tokenExpiry - 300; // 5 min buffer
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken: rt } = getTokens();
  if (!rt) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const data = await res.json();
    if (data.success) {
      setTokens(data.access_token, data.refresh_token, data.exp);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let { accessToken: at } = getTokens();

  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    at = getTokens().accessToken;
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (at) headers['Authorization'] = `Bearer ${at}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newAt = getTokens().accessToken;
      headers['Authorization'] = `Bearer ${newAt}`;
      return fetch(`${API_BASE}${url}`, { ...options, headers });
    }
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}

// ============ AUTH API ============

export const authApi = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(email: string, password: string, fullname: string, username?: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullname, username }),
    });
    return res.json();
  },

  async verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  async resendOtp(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async logout() {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    clearTokens();
  },
};

// ============ JOURNAL API ============

export const journalApi = {
  async getEntries() {
    const res = await authFetch('/api/journal/entries');
    return res.json();
  },

  async getEntry(id: number) {
    const res = await authFetch(`/api/journal/entries/${id}`);
    return res.json();
  },

  async createEntry(data: {
    title: string;
    content: string;
    mood?: string;
    burn_mode?: boolean;
    ghost_mode?: boolean;
    burn_end_time?: string;
    input_method?: string;
  }) {
    const res = await authFetch('/api/journal/entries', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        input_method: data.input_method || 'text',
      }),
    });
    return res.json();
  },

  async updateEntry(id: number, data: { title?: string; content?: string; mood?: string }) {
    const res = await authFetch(`/api/journal/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteEntry(id: number) {
    const res = await authFetch(`/api/journal/entries/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// ============ AI API ============

export const aiApi = {
  async sendMessage(
    message: string,
    mode: string,
    entryContext?: string,
    history: Array<{ role: string; content: string }> = [],
    userName?: string,
    userStyle?: string
  ) {
    const res = await authFetch('/api/ai/companion', {
      method: 'POST',
      body: JSON.stringify({
        message,
        mode,
        entry_context: entryContext || '',
        history,
        user_name: userName || '',
        user_style: userStyle || '',
      }),
    });
    const json = await res.json();
    // Backend returns { success, data: { response, model, mode }, usage }
    if (json.success && json.data) {
      return { success: true, response: json.data.response, model: json.data.model, usage: json.usage };
    }
    return json;
  },

  async getModes() {
    const res = await authFetch('/api/ai/modes');
    return res.json();
  },

  async getUsage() {
    const res = await authFetch('/api/ai/usage');
    return res.json();
  },

  async getHealth() {
    const res = await authFetch('/api/ai/health');
    return res.json();
  },
};

// ============ MOOD API ============

export const moodApi = {
  async getTodayMood() {
    const res = await authFetch('/api/mood/today');
    return res.json();
  },

  async saveMood(mood: string, intensity?: number, note?: string) {
    const res = await authFetch('/api/mood/save', {
      method: 'POST',
      body: JSON.stringify({ mood, intensity: intensity || 5, note }),
    });
    return res.json();
  },
};

// ============ USER API ============

export const userApi = {
  async getProfile() {
    const res = await authFetch('/api/user/profile');
    return res.json();
  },

  async updateProfile(data: { first_name?: string; last_name?: string; username?: string; bio?: string }) {
    const res = await authFetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updatePreferences(prefs: Record<string, unknown>) {
    const res = await authFetch('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await authFetch('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return res.json();
  },
};

// ============ ANALYTICS API ============

export const analyticsApi = {
  async getStats() {
    const res = await authFetch('/api/analytics/stats');
    return res.json();
  },
};

// ============ EXPORT API ============

export const exportApi = {
  async exportPdf(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const url = `/api/export/pdf${params.toString() ? '?' + params.toString() : ''}`;
    const res = await authFetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `diary-export-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      return { success: true };
    }
    return res.json();
  },
};

// ============ SUBSCRIPTION API ============

export const subscriptionApi = {
  async getStatus() {
    const res = await authFetch('/api/subscription/status');
    return res.json();
  },

  async verify() {
    const res = await authFetch('/api/subscription/verify', { method: 'POST' });
    return res.json();
  },

  async upgrade() {
    const res = await authFetch('/api/subscription/upgrade', { method: 'POST' });
    return res.json();
  },

  async getTiers() {
    const res = await fetch(`${API_BASE}/api/subscription/tiers`);
    return res.json();
  },
};
