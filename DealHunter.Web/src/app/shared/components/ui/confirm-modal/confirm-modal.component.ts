import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { LucideAlertTriangle } from '@lucide/angular';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ButtonComponent, LucideAlertTriangle],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onCancel.emit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-icon">
              <svg lucideIcon="alert-triangle" [size]="22"></svg>
            </div>
            <h3 class="modal-title">{{ title() }}</h3>
          </div>

          <p class="modal-message">{{ message() }}</p>

          <div class="modal-actions">
            <app-button variant="ghost" [disabled]="isLoading()" (onClick)="onCancel.emit()">
              {{ cancelLabel() }}
            </app-button>
            <app-button variant="danger" [disabled]="isLoading()" (onClick)="onConfirm.emit()">
              {{ isLoading() ? 'Deleting...' : confirmLabel() }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: var(--panel-bg);
      border: 1px solid var(--neon-red);
      border-radius: 6px;
      padding: 1.5rem;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 0 25px rgba(255, 7, 58, 0.3);
      position: relative;
      animation: scaleUp 0.2s ease-out;
    }
    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1rem;
    }
    .modal-icon {
      padding: 0.6rem;
      border-radius: 50%;
      background: rgba(255, 7, 58, 0.15);
      border: 1px solid var(--neon-red);
      color: var(--neon-red);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      margin: 0;
      font-size: 1.1rem;
      font-family: var(--font-heading);
      color: var(--neon-red);
    }
    .modal-message {
      color: var(--text-main);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      font-family: var(--font-mono);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.8rem;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class ConfirmModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Delete Search Rule');
  message = input<string>('Are you sure you want to delete this rule? This action cannot be undone.');
  confirmLabel = input<string>('Delete');
  cancelLabel = input<string>('Cancel');
  isLoading = input<boolean>(false);

  onConfirm = output<void>();
  onCancel = output<void>();
}
