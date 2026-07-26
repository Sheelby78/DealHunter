import { Component, inject } from '@angular/core';
import { GlitchTextComponent } from '../../components/ui/glitch-text/glitch-text.component';
import { LucideActivity, LucideLogOut } from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [GlitchTextComponent, LucideActivity, LucideLogOut],
  template: `
    <header class="app-header">
      <div class="scanline"></div>
      <app-glitch-text text="DealHunter"></app-glitch-text>
      
      <div class="header-status-container">
        <div class="status-online">
          <span class="online-dot"></span>
          Online
        </div>

        <div class="status-ping">
          <svg lucideActivity [size]="13" class="ping-icon"></svg> 14ms
        </div>

        <button (click)="logout()" class="header-logout-btn" title="Logout">
          <svg lucideLogOut [size]="14"></svg> Logout
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
    .app-header {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: var(--panel-bg);
      border-bottom: 1px solid rgba(57, 255, 20, 0.2);
    }
    .scanline {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.1), transparent);
      animation: scanline 6s infinite linear;
      pointer-events: none;
    }
    .header-status-container {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .status-online {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--neon-green);
      font-family: var(--font-mono);
    }
    .online-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--neon-green);
      box-shadow: 0 0 8px var(--neon-green);
      display: inline-block;
    }
    .status-ping {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .ping-icon {
      color: var(--neon-purple);
    }
    .header-logout-btn {
      background: rgba(255, 7, 58, 0.15);
      border: 1px solid var(--neon-red);
      color: var(--neon-red);
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 7, 58, 0.2);
      margin-left: auto;
    }
    .header-logout-btn:hover {
      background: var(--neon-red);
      color: #000;
      box-shadow: 0 0 15px var(--neon-red);
    }
    @keyframes scanline {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
