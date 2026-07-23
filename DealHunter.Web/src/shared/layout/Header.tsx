import React from 'react';
import { GlitchText } from '@/shared/components/ui/GlitchText';
import { Badge } from '@/shared/components/ui/Badge';
import { Activity, Radio } from 'lucide-react';

export const Header: React.FC = () => {
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
      </div>
    </header>
  );
};
