import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Delete Search Rule',
  message = 'Are you sure you want to delete this rule? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--neon-red)',
              borderRadius: '6px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 0 25px rgba(255, 7, 58, 0.3)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 7, 58, 0.15)',
                  border: '1px solid var(--neon-red)',
                  color: 'var(--neon-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--neon-red)',
                }}
              >
                {title}
              </h3>
            </div>

            <p
              style={{
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                {cancelLabel}
              </Button>
              <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? 'Deleting...' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
