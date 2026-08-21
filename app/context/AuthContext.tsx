"use client";

import { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  login?: string;
  avatar_url?: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Helper functions for cookie operations
  const getSessionCookie = (): User | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(^|;)session=([^;]+)/);
    if (match) {
      try {
        const parsed = JSON.parse(decodeURIComponent(match[2]));
        // Expect cookie format: { user: UserObject, expires: timestamp }
        if (parsed && typeof parsed === 'object' && 'user' in parsed) {
          return parsed.user as User;
        }
        // Fallback: if cookie is just the user object (legacy)
        return parsed as User;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const setSessionCookie = (userData: User) => {
    if (typeof document === 'undefined') return;
    const sessionData = {
      user: userData,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
    };
    document.cookie = `session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${7 * 24 * 60 * 60};`; // 1 week in seconds
  };

  const removeSessionCookie = () => {
    if (typeof document === 'undefined') return;
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  };

  // On initial load, check for session cookie
  useEffect(() => {
    const storedUser = getSessionCookie();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setSessionCookie(userData);
  };

  const register = (userData: User) => {
    setUser(userData);
    setSessionCookie(userData);
  };

  const logout = () => {
    setUser(null);
    removeSessionCookie();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}