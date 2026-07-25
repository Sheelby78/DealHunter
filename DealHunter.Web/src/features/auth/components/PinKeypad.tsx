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
    <div className="pin-keypad">
      {digits.map((digit) => (
        <Button
          key={digit}
          variant="ghost"
          disabled={disabled}
          onClick={() => onKeyPress(digit)}
          className="pin-keypad-btn"
        >
          {digit}
        </Button>
      ))}

      <Button
        variant="danger"
        disabled={disabled}
        onClick={onClear}
        className="pin-keypad-action-btn"
      >
        CLR
      </Button>

      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() => onKeyPress('0')}
        className="pin-keypad-btn"
      >
        0
      </Button>

      <Button
        variant="primary"
        disabled={disabled}
        onClick={onSubmit}
        className="pin-keypad-action-btn"
      >
        AUTH
      </Button>
    </div>
  );
};
