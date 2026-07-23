import React, { useState } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Plus } from 'lucide-react';

interface AddRuleFormProps {
  onAddRule: (url: string, maxPrice: number | null) => void;
}

export const AddRuleForm: React.FC<AddRuleFormProps> = ({ onAddRule }) => {
  const [url, setUrl] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Target URL is required');
      return;
    }

    if (!url.includes('olx.pl')) {
      setError('URL must be a valid OLX.pl link');
      return;
    }

    setError('');
    const parsedPrice = maxPrice ? parseFloat(maxPrice) : null;
    onAddRule(url.trim(), parsedPrice);
    setUrl('');
    setMaxPrice('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="url"
        label="TARGET_URL (OLX.pl)"
        placeholder="https://www.olx.pl/..."
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError('');
        }}
        error={error}
        required
      />
      <Input
        id="max-price"
        label="MAX_PRICE (OPTIONAL)"
        type="number"
        placeholder="e.g. 1500"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <Button type="submit" variant="primary" className="full-width-mobile">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Plus size={18} /> [ EXECUTE_DEPLOYMENT ]
        </span>
      </Button>
    </form>
  );
};
