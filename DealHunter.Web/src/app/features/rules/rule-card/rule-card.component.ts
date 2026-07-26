import { Component, input, output } from '@angular/core';
import { RuleItem } from '../../../shared/models/rule.model';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LucideExternalLink, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-rule-card',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, LucideExternalLink, LucideTrash2],
  template: `
    <div class="rule-card">
      <div class="rule-info">
        <div class="rule-header-row">
          <span class="rule-title">{{ getRuleTitle(rule().url) }}</span>
          @if (rule().maxPrice !== null && rule().maxPrice !== undefined) {
            <app-badge variant="green">Max: {{ rule().maxPrice!.toLocaleString() }} PLN</app-badge>
          }
        </div>
        <a
          [href]="rule().url"
          target="_blank"
          rel="noopener noreferrer"
          class="rule-url"
        >
          {{ getTruncatedUrl(rule().url) }} <svg lucideExternalLink [size]="14"></svg>
        </a>
        <span class="rule-date">Created: {{ rule().createdAt }}</span>
      </div>
      <app-button
        variant="danger"
        class="full-width-mobile"
        (onClick)="onDelete.emit(rule().id)"
      >
        <span class="btn-content">
          <svg lucideTrash2 [size]="16"></svg> Delete
        </span>
      </app-button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .rule-header-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .rule-title {
      color: var(--neon-purple);
      font-weight: bold;
      font-family: var(--font-heading);
      font-size: 1rem;
      text-transform: capitalize;
    }
    .rule-date {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .btn-content {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      justify-content: center;
    }
  `]
})
export class RuleCardComponent {
  rule = input.required<RuleItem>();
  onDelete = output<string>();

  getTruncatedUrl(url: string): string {
    return url.length > 50 ? `${url.substring(0, 50)}...` : url;
  }

  getRuleTitle(url: string): string {
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
  }
}
