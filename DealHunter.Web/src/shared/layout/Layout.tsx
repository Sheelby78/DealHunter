import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab = 'monitor',
  onTabChange,
}) => {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="main-content">{children}</main>
    </div>
  );
};
