/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { loginUser, changeUserPassword, getStudentById } from '../services/api';
import { getDatabase } from '../services/localDb';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, passwordPlain: string, selectedRole: 'ADMIN' | 'STUDENT') => Promise<User>;
  logout: () => void;
  updatePassword: (oldPlain: string, newPlain: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'AH_AUTH_SESSION';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.user && parsed.token) {
            setCurrentUser(parsed.user);
            setToken(parsed.token);
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, passwordPlain: string, selectedRole: 'ADMIN' | 'STUDENT'): Promise<User> => {
    const result = await loginUser(identifier, passwordPlain, selectedRole);
    setCurrentUser(result.user);
    setToken(result.token);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: result.user, token: result.token, lastActive: Date.now() })
    );
    return result.user;
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const updatePassword = async (oldPlain: string, newPlain: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    await changeUserPassword(currentUser.id, oldPlain, newPlain);
    const updated = { ...currentUser, mustChangePassword: false };
    setCurrentUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: updated, token }));
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const db = getDatabase();
      const fresh = db.users.find((u) => u.id === currentUser.id);
      if (fresh) {
        setCurrentUser(fresh);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: fresh, token }));
      }
    } catch (e) {
      console.warn('Could not refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        token,
        isLoading,
        login,
        logout,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
