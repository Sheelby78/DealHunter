import { Component, inject, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PanelComponent } from '../../shared/components/ui/panel/panel.component';
import { GlitchTextComponent } from '../../shared/components/ui/glitch-text/glitch-text.component';
import { PinKeypadComponent } from '../../features/auth/pin-keypad/pin-keypad.component';
import { LucideLock, LucideShieldAlert } from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PanelComponent, GlitchTextComponent, PinKeypadComponent, LucideLock, LucideShieldAlert],
  template: `
    <div class="login-wrapper">
      <app-panel title="DealHunter Access" class="login-panel">
        <div class="login-header-box">
          <div class="lock-icon-box">
            <svg lucideLock [size]="28"></svg>
          </div>

          <div>
            <app-glitch-text text="DealHunter" as="h2" class="title-text"></app-glitch-text>
            <p class="subtitle-text">Enter PIN to access dashboard</p>
          </div>
        </div>

        <div class="pin-display-box" [class.error]="!!errorMsg()">
          @if (pinInput()) {
            <span class="pin-dots">{{ getMaskedPin() }}</span>
          } @else {
            <span class="pin-placeholder">Enter PIN</span>
          }
        </div>

        <div class="login-error-box" [class.visible]="!!errorMsg()">
          <svg lucideShieldAlert [size]="16" class="error-icon"></svg>
          <span class="error-text">{{ errorMsg() || ' ' }}</span>
        </div>

        <app-pin-keypad
          [disabled]="isSubmitting()"
          (onKeyPress)="handleKeyPress($event)"
          (onClear)="handleClear()"
          (onSubmit)="handleSubmit()"
        ></app-pin-keypad>

        <div class="submitting-box" [class.visible]="isSubmitting()">
          <p class="submitting-text">Verifying PIN...</p>
        </div>
      </app-panel>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      padding: 0.8rem;
      width: 100vw;
      box-sizing: border-box;
    }
    .login-panel {
      max-width: 420px;
      width: 100%;
    }
    .login-header-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .lock-icon-box {
      padding: 0.8rem;
      border-radius: 50%;
      background: rgba(188, 19, 254, 0.15);
      border: 1px solid var(--neon-purple);
      color: var(--neon-purple);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title-text {
      font-size: 1.4rem;
      color: var(--neon-purple);
    }
    .subtitle-text {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-family: var(--font-mono);
      margin: 0.3rem 0 0 0;
    }
    .pin-display-box {
      padding: 1.2rem;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid var(--neon-purple);
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    .pin-display-box.error {
      border-color: var(--neon-red);
      box-shadow: 0 0 10px rgba(255, 7, 58, 0.3);
    }
    .pin-dots {
      font-family: var(--font-mono);
      font-size: 1.4rem;
      letter-spacing: 0.35rem;
      color: var(--neon-green);
      line-height: 1;
      white-space: nowrap;
    }
    .pin-placeholder {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1;
      white-space: nowrap;
    }
    .login-error-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem;
      border-radius: 4px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--neon-red);
      opacity: 0;
      transition: all 0.2s ease;
      margin-bottom: 1rem;
      min-height: 38px;
      box-sizing: border-box;
    }
    .login-error-box.visible {
      background: rgba(255, 7, 58, 0.1);
      border-color: var(--neon-red);
      opacity: 1;
    }
    .error-icon {
      flex-shrink: 0;
    }
    .error-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.85rem;
    }
    .submitting-box {
      height: 20px;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .submitting-box.visible {
      opacity: 1;
    }
    .submitting-text {
      margin: 0;
      color: var(--neon-green);
      font-size: 0.75rem;
      font-family: var(--font-mono);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  pinInput = signal<string>('');
  errorMsg = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);

  getMaskedPin(): string {
    return '●'.repeat(this.pinInput().length);
  }

  handleKeyPress(digit: string): void {
    if (this.pinInput().length < 16) {
      this.pinInput.update(prev => prev + digit);
      this.errorMsg.set(null);
    }
  }

  handleClear(): void {
    this.pinInput.set('');
    this.errorMsg.set(null);
  }

  async handleSubmit(): Promise<void> {
    const pin = this.pinInput().trim();
    if (!pin || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMsg.set(null);

    try {
      const success = await this.authService.login(pin);
      if (success) {
        await this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg.set('Invalid PIN');
        this.pinInput.set('');
      }
    } catch {
      this.errorMsg.set('Unable to connect to auth service');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key >= '0' && event.key <= '9') {
      this.handleKeyPress(event.key);
    } else if (event.key === 'Backspace') {
      this.pinInput.update(prev => prev.slice(0, -1));
      this.errorMsg.set(null);
    } else if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }
}
