export type ButtonVariant = 'primary' | 'danger' | 'ghost';
export type BadgeVariant = 'green' | 'purple' | 'red';

export interface RuleItem {
  id: string;
  url: string;
  maxPrice: number | null;
  createdAt: string;
}
