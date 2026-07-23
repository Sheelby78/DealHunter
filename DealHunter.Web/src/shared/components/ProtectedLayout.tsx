import React from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { LoginPage } from '@/features/auth/pages/LoginPage';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
