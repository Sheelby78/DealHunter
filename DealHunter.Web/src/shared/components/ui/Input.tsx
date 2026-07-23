import React, { useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  stepAmount?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  type,
  className = '',
  style,
  value,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--neon-purple)',
    fontSize: '1rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.6)',
    border: error ? '1px solid var(--neon-red)' : '1px solid var(--text-muted)',
    color: 'var(--neon-green)',
    padding: type === 'number' ? '0.9rem 3rem 0.9rem 1rem' : '1rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
    ...style,
  };

  const handleStep = (direction: 'up' | 'down') => {
    if (!inputRef.current) return;

    const rawVal = value !== undefined && value !== null ? String(value) : inputRef.current.value || '0';
    const currentVal = parseFloat(rawVal) || 0;
    const step = 100; // Step by 100 PLN for price inputs
    const newVal = direction === 'up' ? currentVal + step : Math.max(0, currentVal - step);

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeSetter?.call(inputRef.current, String(newVal));

    const event = new Event('input', { bubbles: true });
    inputRef.current.dispatchEvent(event);
  };

  const stepperBtnStyle: React.CSSProperties = {
    background: 'rgba(188, 19, 254, 0.15)',
    border: '1px solid var(--neon-purple)',
    color: 'var(--neon-purple)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '18px',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          style={inputStyle}
          className={`cyberpunk-input ${className}`}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--neon-red)' : 'var(--neon-green)';
            e.currentTarget.style.boxShadow = error
              ? '0 0 15px rgba(255, 7, 58, 0.4)'
              : '0 0 15px rgba(57, 255, 20, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--neon-red)' : 'var(--text-muted)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />

        {type === 'number' && (
          <div
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <button
              type="button"
              tabIndex={-1}
              style={stepperBtnStyle}
              onClick={() => handleStep('up')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--neon-purple)';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = '0 0 10px var(--neon-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(188, 19, 254, 0.15)';
                e.currentTarget.style.color = 'var(--neon-purple)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              style={stepperBtnStyle}
              onClick={() => handleStep('down')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--neon-purple)';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.boxShadow = '0 0 10px var(--neon-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(188, 19, 254, 0.15)';
                e.currentTarget.style.color = 'var(--neon-purple)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
      {error && (
        <span style={{ color: 'var(--neon-red)', fontSize: '0.85rem' }}>
          {error}
        </span>
      )}
    </div>
  );
};
