import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { PinKeypad } from '@/features/auth/components/PinKeypad';
import { Panel } from '@/shared/components/ui/Panel';
import { GlitchText } from '@/shared/components/ui/GlitchText';
import { Lock, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyPress = (digit: string) => {
    if (pinInput.length < 16) {
      setPinInput((prev) => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!pinInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const success = await login(pinInput);
      if (!success) {
        setErrorMsg('Invalid PIN');
        setPinInput('');
      }
    } catch {
      setErrorMsg('Unable to connect to auth service');
    } finally {
      setIsSubmitting(false);
    }
  }, [pinInput, isSubmitting, login]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        setPinInput((prev) => prev.slice(0, -1));
        setErrorMsg(null);
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-color)',
        padding: '0.8rem',
      }}
    >
      <Panel title="DealHunter Access" className="login-panel">
        <div className="login-header-box">
          <div className="lock-icon-box">
            <Lock size={28} />
          </div>

          <div>
            <GlitchText text="DealHunter" as="h2" style={{ fontSize: '1.4rem', color: 'var(--neon-purple)' }} />
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                margin: '0.3rem 0 0 0',
              }}
            >
              Enter PIN to access dashboard
            </p>
          </div>
        </div>

        <div
          className="pin-display-box"
          style={{
            border: `1px solid ${errorMsg ? 'var(--neon-red)' : 'var(--neon-purple)'}`,
            boxShadow: errorMsg ? '0 0 10px rgba(255, 7, 58, 0.3)' : 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {pinInput ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.4rem',
                letterSpacing: '0.35rem',
                color: 'var(--neon-green)',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              {'●'.repeat(pinInput.length)}
            </span>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              Enter PIN
            </span>
          )}
        </div>

        <div
          className="login-error-box"
          style={{
            background: errorMsg ? 'rgba(255, 7, 58, 0.1)' : 'transparent',
            border: `1px solid ${errorMsg ? 'var(--neon-red)' : 'transparent'}`,
            color: 'var(--neon-red)',
            opacity: errorMsg ? 1 : 0,
          }}
        >
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {errorMsg || ' '}
          </span>
        </div>

        <PinKeypad
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
        />

        <div
          style={{
            height: '20px',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSubmitting ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <p
            style={{
              margin: 0,
              color: 'var(--neon-green)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Verifying PIN...
          </p>
        </div>
      </Panel>
    </div>
  );
};
