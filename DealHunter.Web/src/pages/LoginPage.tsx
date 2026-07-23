import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { PinKeypad } from '../components/PinKeypad';
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
        setErrorMsg('INVALID_PIN_CREDENTIAL');
        setPinInput('');
      }
    } catch {
      setErrorMsg('CONNECTION_ERROR // UNABLE TO REACH AUTH SERVICE');
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
        title="SYSTEM AUTHORIZATION GATE"
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

          <GlitchText text="DEALHUNTER_OS v1.0" as="h2" style={{ fontSize: '1.4rem', color: 'var(--neon-purple)' }} />
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px',
            }}
          >
            RESTRICTED ACCESS // INPUT PIN
          </p>
        </div>

        {/* Masked PIN Display */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: `1px solid ${errorMsg ? 'var(--neon-red)' : 'var(--neon-purple)'}`,
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            minHeight: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: errorMsg ? '0 0 10px rgba(255, 7, 58, 0.3)' : 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {pinInput ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.8rem',
                letterSpacing: '0.5rem',
                color: 'var(--neon-green)',
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
                letterSpacing: '2px',
              }}
            >
              [ ENTER PIN ]
            </span>
          )}
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(255, 7, 58, 0.1)',
              border: '1px solid var(--neon-red)',
              color: 'var(--neon-red)',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <PinKeypad
          onKeyPress={handleKeyPress}
          onClear={handleClear}
          onSubmit={handleSubmit}
          disabled={isSubmitting}
        />

        {isSubmitting && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--neon-green)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              marginTop: '1rem',
            }}
          >
            [ VERIFYING PIN CREDENTIAL... ]
          </p>
        )}
      </Panel>
    </div>
  );
};
