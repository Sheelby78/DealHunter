import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'green' | 'purple' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'green',
}) => {
  const accentColor =
    variant === 'purple'
      ? 'var(--neon-purple)'
      : variant === 'blue'
      ? '#00e5ff'
      : 'var(--neon-green)';

  return (
    <div
      style={{
        background: 'var(--panel-bg)',
        border: `1px solid ${accentColor}40`,
        borderRadius: '4px',
        padding: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 15px rgba(0, 0, 0, 0.5), inset 0 0 15px ${accentColor}0a`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-heading)',
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}60`,
          }}
        >
          {value}
        </span>
        {subtext && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            {subtext}
          </span>
        )}
      </div>

      <div
        style={{
          padding: '0.8rem',
          borderRadius: '8px',
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};
