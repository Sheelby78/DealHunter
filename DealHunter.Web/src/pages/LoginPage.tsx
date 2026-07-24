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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-color)',
        padding: '1rem',
      }}
    >
      <Panel
        title="DealHunter Access"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '1rem',
              borderRadius: '50%',
              background: 'rgba(188, 19, 254, 0.1)',
              border: '1px solid var(--neon-purple)',
              color: 'var(--neon-purple)',
              marginBottom: '1rem',
            }}
          >
            <Lock size={32} />
          </div>

          <GlitchText text="DealHunter" as="h2" style={{ fontSize: '1.4rem', color: 'var(--neon-purple)' }} />
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Enter PIN to access dashboard
          </p>
        </div>

        {/* Masked PIN Display */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${errorMsg ? 'var(--neon-red)' : 'var(--neon-purple)'}`,
            padding: '0 1rem',
            marginBottom: '1.2rem',
            textAlign: 'center',
            height: '60px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: errorMsg ? '0 0 10px rgba(255, 7, 58, 0.3)' : 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {pinInput ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.5rem',
                letterSpacing: '0.4rem',
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
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              Enter PIN
            </span>
          )}
        </div>

        {/* Reserved Fixed Error Alert Slot */}
        <div
          style={{
            height: '42px',
            marginBottom: '1.2rem',
            background: errorMsg ? 'rgba(255, 7, 58, 0.1)' : 'transparent',
            border: `1px solid ${errorMsg ? 'var(--neon-red)' : 'transparent'}`,
            color: 'var(--neon-red)',
            padding: '0.6rem 0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '4px',
            opacity: errorMsg ? 1 : 0,
            transition: 'opacity 0.2s ease, border-color 0.2s ease',
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {errorMsg || ' '}
          </span>
        </div>

        {/* Numeric Keypad */}
        <PinKeypad
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
        />

        {/* Reserved Fixed Status Slot */}
        <div
          style={{
            height: '24px',
            marginTop: '0.8rem',
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
              fontSize: '0.8rem',
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
