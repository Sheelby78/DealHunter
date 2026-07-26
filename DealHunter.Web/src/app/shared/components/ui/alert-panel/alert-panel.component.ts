import { Component, input, output } from '@angular/core';
import { PanelComponent } from '../panel/panel.component';
import { ButtonComponent } from '../button/button.component';
import { LucideWifiOff, LucideRefreshCw } from '@lucide/angular';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [PanelComponent, ButtonComponent, LucideWifiOff, LucideRefreshCw],
  template: `
    <app-panel [title]="title()" class="border-neon-red">
      <div class="alert-content">
        <div class="alert-icon-wrapper">
          <svg lucideWifiOff [size]="36"></svg>
        </div>
        <p class="alert-message">{{ message() }}</p>
        @if (showRetry()) {
          <app-button variant="danger" [disabled]="isRetrying()" (onClick)="onRetry.emit()">
            <span class="btn-inner">
              <svg lucideRefreshCw [size]="16" [class.spin-animation]="isRetrying()"></svg>
              {{ isRetrying() ? '[ CONNECTING... ]' : '[ RETRY_CONNECTION ]' }}
            </span>
          </app-button>
        }
      </div>
    </app-panel>
  `,
  styles: [`
    :host {
      display: block;
    }
    .border-neon-red {
      border-color: var(--neon-red) !important;
    }
    .alert-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      text-align: center;
      background: rgba(255, 7, 58, 0.05);
      border: 1px solid rgba(255, 7, 58, 0.3);
    }
    .alert-icon-wrapper {
      color: var(--neon-red);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .alert-message {
      color: var(--neon-red);
      font-family: var(--font-mono);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      letter-spacing: 1px;
    }
    .btn-inner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class AlertPanelComponent {
  title = input<string>('SYSTEM_CONNECTION_ALERT');
  message = input<string>('');
  showRetry = input<boolean>(true);
  isRetrying = input<boolean>(false);
  onRetry = output<void>();
}
