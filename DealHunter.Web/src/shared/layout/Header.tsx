import React from 'react';
import { GlitchText } from '@/shared/components/ui/GlitchText';
import { Activity, LogOut } from 'lucide-react';
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
      <GlitchText text="DealHunter" />
      <div className="header-status-container" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--neon-green)',
              boxShadow: '0 0 8px var(--neon-green)',
              display: 'inline-block',
            }}
          />
          Online
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <Activity size={13} style={{ color: 'var(--neon-purple)' }} /> 14ms
        </div>

        <button
          onClick={logout}
          className="header-logout-btn"
          style={{
            background: 'rgba(255, 7, 58, 0.15)',
            border: '1px solid var(--neon-red)',
            color: 'var(--neon-red)',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px rgba(255, 7, 58, 0.2)',
            marginLeft: 'auto',
          }}
          title="Logout"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
};
