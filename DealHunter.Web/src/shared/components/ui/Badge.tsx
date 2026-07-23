import React from 'react';
import { BadgeVariant } from '@/shared/types/theme';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'green',
  children,
  className = '',
  style,
}) => {
  const getBadgeStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'purple':
        return {
          background: 'rgba(188, 19, 254, 0.1)',
          color: 'var(--neon-purple)',
          borderColor: 'var(--neon-purple)',
        };
      case 'red':
        return {
          background: 'rgba(255, 7, 58, 0.1)',
          color: 'var(--neon-red)',
          borderColor: 'var(--neon-red)',
        };
      case 'green':
      default:
        return {
          background: 'rgba(57, 255, 20, 0.15)',
          color: 'var(--neon-green)',
          borderColor: 'rgba(57, 255, 20, 0.5)',
        };
    }
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    borderRadius: '2px',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold',
    border: '1px solid',
    ...getBadgeStyles(),
    ...style,
  };

  return (
    <span style={badgeStyle} className={`cyberpunk-badge ${className}`}>
      {children}
    </span>
  );
};
