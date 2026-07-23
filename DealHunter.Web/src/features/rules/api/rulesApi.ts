import { fetchWithAuth } from '@/lib/api';
import { RuleItem } from '@/shared/types/models';

export async function getRules(pin: string | null): Promise<RuleItem[]> {
  const response = await fetchWithAuth('/api/rules', { method: 'GET' }, pin);
  const data = await response.json();
  return data as RuleItem[];
}

export async function createRule(
  url: string,
  maxPrice: number | null,
  pin: string | null
): Promise<RuleItem> {
  const response = await fetchWithAuth(
    '/api/rules',
    {
      method: 'POST',
      body: JSON.stringify({ url, maxPrice }),
    },
    pin
  );
  const data = await response.json();
  return data as RuleItem;
}

export async function deleteRule(
  id: string,
  pin: string | null
): Promise<void> {
  await fetchWithAuth(
    `/api/rules/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    pin
  );
}

