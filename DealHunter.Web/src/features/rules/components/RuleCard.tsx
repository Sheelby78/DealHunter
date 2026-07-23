import React from 'react';
import { RuleItem } from '@/shared/types/theme';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ExternalLink, Trash2 } from 'lucide-react';

interface RuleCardProps {
  rule: RuleItem;
  onDelete: (id: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onDelete }) => {
  const truncatedUrl = rule.url.length > 60 ? `${rule.url.substring(0, 60)}...` : rule.url;

  return (
    <div
      className="rule-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(188, 19, 254, 0.1)';
        e.currentTarget.style.borderLeftColor = 'var(--neon-green)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderLeftColor = 'var(--neon-purple)';
      }}
    >
      <div className="rule-info">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              color: 'var(--neon-purple)',
              fontWeight: 'bold',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
            }}
          >
            [{rule.id}]
          </span>
          {rule.maxPrice !== null && (
            <Badge variant="green">MAX: {rule.maxPrice} PLN</Badge>
          )}
        </div>
        <a
          href={rule.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rule-url"
        >
          {truncatedUrl} <ExternalLink size={14} />
        </a>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          INITIATED: {rule.createdAt}
        </span>
      </div>
      <Button
        variant="danger"
        className="full-width-mobile"
        onClick={() => onDelete(rule.id)}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
          <Trash2 size={16} /> [ TERMINATE ]
        </span>
      </Button>
    </div>
  );
};
