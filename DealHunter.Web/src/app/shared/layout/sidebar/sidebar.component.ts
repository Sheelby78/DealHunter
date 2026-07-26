import { Component, input, output } from '@angular/core';
import { LucideTerminal, LucideSliders, LucideShieldCheck } from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideTerminal, LucideSliders, LucideShieldCheck],
  template: `
    <aside class="app-sidebar">
      <nav class="sidebar-nav">
        <button
          [class.active]="activeTab() === 'monitor'"
          class="nav-item"
          (click)="onTabChange.emit('monitor')"
        >
          <svg lucideIcon="terminal" [size]="18"></svg> Monitor
        </button>
        <button
          [class.active]="activeTab() === 'logs'"
          class="nav-item"
          (click)="onTabChange.emit('logs')"
        >
          <svg lucideIcon="sliders" [size]="18"></svg> Logs
        </button>
        <button
          [class.active]="activeTab() === 'settings'"
          class="nav-item"
          (click)="onTabChange.emit('settings')"
        >
          <svg lucideIcon="shield-check" [size]="18"></svg> Settings
        </button>
      </nav>

      <div class="terminal-info-box">
        <div>User: Admin</div>
        <div>Version: 1.0.0</div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
    .app-sidebar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .nav-item {
      padding: 0.8rem 1rem;
      color: var(--text-main);
      background: transparent;
      border-left: 3px solid transparent;
      text-decoration: none;
      font-size: 1rem;
      font-family: var(--font-mono);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      outline: none;
      border-top: none;
      border-right: none;
      border-bottom: none;
      text-shadow: none;
      width: 100%;
      text-align: left;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--neon-green);
    }
    .nav-item.active {
      color: var(--neon-green);
      background: rgba(57, 255, 20, 0.1);
      border-left-color: var(--neon-green);
      text-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
    }
    .terminal-info-box {
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px solid rgba(57, 255, 20, 0.2);
    }
  `]
})
export class SidebarComponent {
  activeTab = input<string>('monitor');
  onTabChange = output<string>();
}
