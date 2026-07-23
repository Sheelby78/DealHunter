import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fetchWithAuth, ApiError } from '@/lib/api';

const PIN_STORAGE_KEY = 'dealhunter_pin';

interface AuthContextType {
  pin: string | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pin, setPin] = useState<string | null>(() => {
    return localStorage.getItem(PIN_STORAGE_KEY);
  });

  const isAuthenticated = Boolean(pin);

  const logout = useCallback(() => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    setPin(null);
  }, []);

  const login = useCallback(async (candidatePin: string): Promise<boolean> => {
    try {
      const response = await fetchWithAuth('/api/rules', { method: 'GET' }, candidatePin);
      if (response.ok) {
        localStorage.setItem(PIN_STORAGE_KEY, candidatePin);
        setPin(candidatePin);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return false;
      }
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ pin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
