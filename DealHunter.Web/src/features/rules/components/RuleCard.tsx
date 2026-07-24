import React from 'react';
import { RuleItem } from '@/shared/types/models';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ExternalLink, Trash2 } from 'lucide-react';

interface RuleCardProps {
  rule: RuleItem;
  onDelete: (id: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onDelete }) => {
  const getRuleTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const search = urlObj.searchParams.get('q') || urlObj.searchParams.get('search[query]');
      if (search) {
        return search.replace(/-/g, ' ');
      }
      const pathname = urlObj.pathname.replace(/^\/|\/$/g, '');
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        const cleanName = lastSegment
          .replace(/^q-/, '')
          .replace(/\.html$/, '')
          .replace(/-\d+$/, '')
          .replace(/-/g, ' ');
        if (cleanName.length > 0) {
          return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
      }
    } catch {
      // Fallback if invalid URL string
    }
    return 'OLX Search Rule';
  };

  const title = getRuleTitle(rule.url);
  const truncatedUrl = rule.url.length > 50 ? `${rule.url.substring(0, 50)}...` : rule.url;

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
              fontSize: '1rem',
              textTransform: 'capitalize',
            }}
          >
            {title}
          </span>
          {rule.maxPrice !== null && (
            <Badge variant="green">Max: {rule.maxPrice.toLocaleString()} PLN</Badge>
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
          Created: {rule.createdAt}
        </span>
      </div>
      <Button
        variant="danger"
        className="full-width-mobile"
        onClick={() => onDelete(rule.id)}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
          <Trash2 size={16} /> Delete
        </span>
      </Button>
    </div>
  );
};
