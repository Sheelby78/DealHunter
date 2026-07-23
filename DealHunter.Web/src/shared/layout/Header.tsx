import React from 'react';
import { GlitchText } from '@/shared/components/ui/GlitchText';
import { Badge } from '@/shared/components/ui/Badge';
import { Activity, Radio, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

export const Header: React.FC = () => {
  const { logout } = useAuth();

  const scanlineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.1), transparent)',
    animation: 'scanline 6s infinite linear',
    pointerEvents: 'none',
  };

  return (
    <header className="app-header">
      <div style={scanlineStyle} />
      <GlitchText text="DealHunter_OS" />
      <div className="header-status-container">
        <Badge variant="green">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Radio size={14} /> SYS: ONLINE
          </span>
        </Badge>
        <Badge variant="purple">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={14} /> 14ms
          </span>
        </Badge>
        <button
          onClick={logout}
          className="header-logout-btn"
          style={{
            background: 'rgba(255, 7, 58, 0.1)',
            border: '1px solid var(--neon-red)',
            color: 'var(--neon-red)',
            padding: '0.3rem 0.6rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.3s ease',
            marginLeft: 'auto',
          }}
          title="Logout Terminal"
        >
          <LogOut size={14} /> [ LOGOUT ]
        </button>
      </div>
    </header>
  );
};
