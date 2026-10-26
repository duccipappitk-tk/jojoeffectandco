import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials provided by user
export const DEFAULT_SUPABASE_URL = 'https://xbkpejsbfunpyvrsyuzc.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhia3BlanNiZnVucHl2cnN5dXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTcyMzksImV4cCI6MjEwODU5MzIzOX0.8MiFT6TgHxWxPzOBKFabiD1b6DK4sOETwXGIzTjzH8A';

export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '');
  // Strip /rest/v1 if provided
  clean = clean.replace(/\/rest\/v1$/, '');
  return clean;
}

// Read from localStorage override, Vite env variables, or default user credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('jojo_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('jojo_supabase_anon_key') || '' : '';

const rawActiveUrl = localUrl || envUrl || DEFAULT_SUPABASE_URL;
const rawActiveKey = localKey || envAnonKey || DEFAULT_SUPABASE_ANON_KEY;

export const activeUrl = normalizeSupabaseUrl(rawActiveUrl);
export const activeKey = rawActiveKey.trim();

export const isSupabaseConfigured = Boolean(
  activeUrl && 
  activeKey && 
  activeUrl.startsWith('https://') && 
  !activeUrl.includes('placeholder')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

export function updateSupabaseConfig(url: string, key: string): { success: boolean; message: string } {
  if (!url || !key) {
    localStorage.removeItem('jojo_supabase_url');
    localStorage.removeItem('jojo_supabase_anon_key');
    // Fallback to default
    supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
    return { success: true, message: 'Supabase configuration reset to default project.' };
  }
  
  const cleanedUrl = normalizeSupabaseUrl(url);
  if (!cleanedUrl.startsWith('https://')) {
    return { success: false, message: 'Supabase URL must start with https://' };
  }

  try {
    localStorage.setItem('jojo_supabase_url', cleanedUrl);
    localStorage.setItem('jojo_supabase_anon_key', key.trim());
    supabase = createClient(cleanedUrl, key.trim());
    return { success: true, message: 'Supabase connected successfully to: ' + cleanedUrl };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to initialize Supabase.' };
  }
}

export function getActiveSupabaseConfig() {
  return {
    url: activeUrl,
    key: activeKey ? `${activeKey.substring(0, 10)}...${activeKey.substring(activeKey.length - 6)}` : '',
    rawKey: activeKey,
    isConfigured: isSupabaseConfigured,
  };
}
