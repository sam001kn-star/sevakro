import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getSession, saveSession, clearSession } from '@/lib/customAuth';

const CustomAuthContext = createContext();

export const CustomAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setIsLoading(false);
  }, []);

  const login = useCallback((userData) => {
    saveSession(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback((updatedData) => {
    const updated = { ...user, ...updatedData };
    saveSession(updated);
    setUser(updated);
  }, [user]);

  return (
    <CustomAuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </CustomAuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  const ctx = useContext(CustomAuthContext);
  if (!ctx) throw new Error('useCustomAuth must be used within CustomAuthProvider');
  return ctx;
};