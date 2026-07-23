import React from 'react';
import { Button } from '@/shared/components/ui/Button';

interface PinKeypadProps {
  onKeyPress: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({
  onKeyPress,
  onClear,
  onSubmit,
  disabled = false,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.8rem',
        width: '100%',
        maxWidth: '320px',
        margin: '0 auto',
      }}
    >
      {digits.map((digit) => (
        <Button
          key={digit}
          variant="ghost"
          disabled={disabled}
          onClick={() => onKeyPress(digit)}
          style={{
            padding: '1rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {digit}
        </Button>
      ))}

      <Button
        variant="danger"
        disabled={disabled}
        onClick={onClear}
        style={{
          padding: '1rem 0.5rem',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-heading)',
        }}
      >
        CLR
      </Button>

      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => onKeyPress('0')}
        style={{
          padding: '1rem',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-mono)',
        }}
      >
        0
      </Button>

      <Button
        variant="primary"
        disabled={disabled}
        onClick={onSubmit}
        style={{
          padding: '1rem 0.5rem',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-heading)',
        }}
      >
        AUTH
      </Button>
    </div>
  );
};
