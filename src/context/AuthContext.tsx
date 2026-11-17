import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { User } from '../types';
import { useApp } from './AppContext';

interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => { user?: User; error?: string };
  register: (payload: RegisterPayload) => { user?: User; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePasswordDemo: (currentPassword: string, newPassword: string) => { error?: string };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, addUser, updateUser, showToast } = useApp();
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    authService.getStoredSessionUserId()
  );

  const currentUser = useMemo(() => {
    if (!sessionUserId) return null;
    const found = users.find((u) => u.id === sessionUserId);
    if (!found || found.status === 'suspended') {
      return null;
    }
    return found;
  }, [sessionUserId, users]);

  const login = useCallback(
    (payload: LoginPayload) => {
      const result = authService.authenticate(users, payload);
      if (result.user) {
        setSessionUserId(result.user.id);
        showToast(`Welcome back, ${result.user.name}`, 'success');
      }
      return result;
    },
    [users, showToast]
  );

  const register = useCallback(
    (payload: RegisterPayload) => {
      const result = authService.createUserRecord(users, payload);
      if (result.user) {
        addUser(result.user);
        authService.persistSession(result.user.id, true);
        setSessionUserId(result.user.id);
        showToast('Account created successfully', 'success', `Signed in as ${result.user.name}`);
      }
      return result;
    },
    [users, addUser, showToast]
  );

  const logout = useCallback(() => {
    authService.clearSession();
    setSessionUserId(null);
    showToast('Signed out', 'info');
  }, [showToast]);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!currentUser) return;
      updateUser(currentUser.id, updates);
      showToast('Profile saved', 'success');
    },
    [currentUser, updateUser, showToast]
  );

  const changePasswordDemo = useCallback(
    (currentPassword: string, newPassword: string): { error?: string } => {
      if (!currentUser) return { error: 'Not authenticated.' };
      if (currentUser.password !== currentPassword) {
        return { error: 'Current password is incorrect.' };
      }
      if (newPassword.length < 8) {
        return { error: 'New password must be at least 8 characters long.' };
      }
      updateUser(currentUser.id, { password: newPassword });
      showToast('Demonstration password updated', 'success');
      return {};
    },
    [currentUser, updateUser, showToast]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        register,
        logout,
        updateProfile,
        changePasswordDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
