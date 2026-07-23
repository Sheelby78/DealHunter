import React from 'react';
import { ButtonVariant } from '@/shared/types/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'danger':
        return {
          background: 'rgba(255, 7, 58, 0.1)',
          color: 'var(--neon-red)',
          borderColor: 'var(--neon-red)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-main)',
          borderColor: 'var(--text-muted)',
        };
      case 'primary':
      default:
        return {
          background: 'rgba(57, 255, 20, 0.1)',
          color: 'var(--neon-green)',
          borderColor: 'var(--neon-green)',
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    padding: '0.8rem 1.5rem',
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '1px',
    border: '1px solid',
    outline: 'none',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      style={baseStyle}
      className={`cyberpunk-btn ${variant} ${className}`}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--neon-green)';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.boxShadow = '0 0 20px var(--neon-green)';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'var(--neon-red)';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.boxShadow = '0 0 20px var(--neon-red)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'var(--neon-purple)';
          e.currentTarget.style.color = 'var(--neon-purple)';
        }
      }}
      onMouseLeave={(e) => {
        const reset = getVariantStyles();
        e.currentTarget.style.background = reset.background as string;
        e.currentTarget.style.color = reset.color as string;
        e.currentTarget.style.borderColor = reset.borderColor as string;
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
};
