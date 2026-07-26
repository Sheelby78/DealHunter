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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
