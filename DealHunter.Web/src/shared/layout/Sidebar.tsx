import React from 'react';
import { Terminal, Sliders, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'monitor',
  onTabChange,
}) => {
  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.8rem 1rem',
    color: isActive ? 'var(--neon-green)' : 'var(--text-main)',
    background: isActive ? 'rgba(57, 255, 20, 0.1)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--neon-green)' : '3px solid transparent',
    textDecoration: 'none',
    fontSize: '1rem',
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    outline: 'none',
    border: 'none',
    textShadow: isActive ? '0 0 8px rgba(57, 255, 20, 0.5)' : 'none',
  });

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <button
          className={activeTab === 'monitor' ? 'active' : ''}
          style={navItemStyle(activeTab === 'monitor')}
          onClick={() => onTabChange?.('monitor')}
        >
          <Terminal size={18} /> Monitor
        </button>
        <button
          className={activeTab === 'logs' ? 'active' : ''}
          style={navItemStyle(activeTab === 'logs')}
          onClick={() => onTabChange?.('logs')}
        >
          <Sliders size={18} /> Logs
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          style={navItemStyle(activeTab === 'settings')}
          onClick={() => onTabChange?.('settings')}
        >
          <ShieldCheck size={18} /> Settings
        </button>
      </nav>

      <div className="terminal-info-box">
        <div>User: Admin</div>
        <div>Version: 1.0.0</div>
      </div>
    </aside>
  );
};
