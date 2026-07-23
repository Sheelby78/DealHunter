import { fetchWithAuth } from '@/lib/api';
import { RuleItem } from '@/shared/types/theme';

export async function getRules(pin: string | null): Promise<RuleItem[]> {
  const response = await fetchWithAuth('/api/rules', { method: 'GET' }, pin);
  const data = await response.json();
  return data as RuleItem[];
}
