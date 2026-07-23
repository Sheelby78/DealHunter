import React from 'react';
import { Panel } from './Panel';
import { Button } from './Button';
import { WifiOff, RefreshCw } from 'lucide-react';

interface AlertPanelProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  title = 'SYSTEM_CONNECTION_ALERT',
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <Panel title={title} className="border-neon-red">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          textAlign: 'center',
          background: 'rgba(255, 7, 58, 0.05)',
          border: '1px solid rgba(255, 7, 58, 0.3)',
        }}
      >
        <div
          style={{
            color: 'var(--neon-red)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <WifiOff size={36} />
        </div>

        <p
          style={{
            color: 'var(--neon-red)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            letterSpacing: '1px',
          }}
        >
          {message}
        </p>

        {onRetry && (
          <Button
            variant="danger"
            onClick={onRetry}
            disabled={isRetrying}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={16} className={isRetrying ? 'spin-animation' : ''} />
            {isRetrying ? '[ CONNECTING... ]' : '[ RETRY_CONNECTION ]'}
          </Button>
        )}
      </div>
    </Panel>
  );
};
