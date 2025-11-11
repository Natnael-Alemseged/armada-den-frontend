'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { loginUser, registerUser, logoutUser, fetchUserProfile } from '@/lib/slices/authThunk';
import { clearError } from '@/lib/slices/authSlice';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, loading, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any stale errors on mount
    dispatch(clearError());

    // Check if user is already logged in using Redux state token
    const checkAuth = async () => {
      try {
        // Only fetch profile if we have a token but no user data
        if (token && !user) {
          await dispatch(fetchUserProfile()).unwrap();
        }
      } catch (error) {
        // Silently handle auth check failures - don't show error to user
        // The 401 interceptor will handle logout if needed
        console.log('Auth check failed - user will need to login');
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await dispatch(registerUser({ email, password })).unwrap();
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}