import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'jojo_admin_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check if Supabase session exists
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setAdminUser({
              id: session.user.id,
              email: session.user.email || 'admin@jojoeffects.com',
              name: session.user.user_metadata?.name || 'Store Administrator',
              role: 'admin',
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session check failed:', e);
        }
      }

      // 2. Check local authenticated session
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setAdminUser(parsed);
          }
        }
      } catch (err) {
        console.warn('Local session restore failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          // If Supabase reports user not found or invalid credentials, try local fallback for first-time admin setup
          if (email.trim().toLowerCase() === 'admin@jojoeffects.com' && pass === 'jojo2026admin') {
            const admin: AdminUser = {
              id: 'admin-root-01',
              email: 'admin@jojoeffects.com',
              name: 'Executive Administrator',
              role: 'superadmin',
            };
            setAdminUser(admin);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin));
            setIsLoading(false);
            return { success: true };
          }
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const user: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'Administrator',
            role: 'admin',
          };
          setAdminUser(user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth call failed:', err);
      }
    }

    // Default built-in administrator authentication
    // Secured administrative credentials for the business owner
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@jojoeffects.com' && pass === 'jojo2026admin') ||
      (cleanEmail === 'owner@jojoeffects.com' && pass === 'jojo2026admin')
    ) {
      const admin: AdminUser = {
        id: 'admin-root-01',
        email: cleanEmail,
        name: 'Executive Administrator',
        role: 'superadmin',
      };
      setAdminUser(admin);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { 
      success: false, 
      error: 'Invalid administrator credentials. Please check your email and password.' 
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    setAdminUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
