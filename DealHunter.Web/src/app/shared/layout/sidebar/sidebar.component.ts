import { Component, input, output } from '@angular/core';
import { LucideTerminal, LucideSliders, LucideShieldCheck } from '@lucide/angular';
import { TabType } from '../layout.component';

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
          <svg lucideTerminal [size]="18"></svg> Monitor
        </button>
        <button
          [class.active]="activeTab() === 'logs'"
          class="nav-item"
          (click)="onTabChange.emit('logs')"
        >
          <svg lucideSliders [size]="18"></svg> Logs
        </button>
        <button
          [class.active]="activeTab() === 'settings'"
          class="nav-item"
          (click)="onTabChange.emit('settings')"
        >
          <svg lucideShieldCheck [size]="18"></svg> Settings
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
      grid-row: 1 / -1;
      height: 100%;
    }
    .app-sidebar {
      background: var(--panel-bg);
      border-right: 1px solid rgba(188, 19, 254, 0.3);
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.5rem;
      backdrop-filter: blur(5px);
      height: 100%;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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
      margin-top: auto;
      padding: 1rem;
      border: 1px dashed var(--text-muted);
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    @media (max-width: 768px) {
      :host {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: auto;
        z-index: 100;
        grid-row: auto;
      }
      .app-sidebar {
        width: 100%;
        height: auto;
        padding: 0.4rem 0.5rem;
        padding-bottom: calc(0.4rem + env(safe-area-inset-bottom, 0px));
        border-right: none;
        border-top: 2px solid var(--neon-purple);
        background: rgba(13, 15, 18, 0.95);
        backdrop-filter: blur(12px);
        box-shadow: 0 -4px 20px rgba(188, 19, 254, 0.2);
        flex-direction: row;
        justify-content: space-around;
        gap: 0;
      }
      .sidebar-nav {
        flex-direction: row;
        width: 100%;
        justify-content: space-around;
        gap: 0.2rem;
      }
      .nav-item {
        flex: 1;
        justify-content: center;
        padding: 0.6rem 0.2rem;
        font-size: 0.8rem;
        border-left: none;
        border-bottom: 2px solid transparent;
      }
      .nav-item.active {
        background: rgba(57, 255, 20, 0.1);
        border-left-color: transparent;
        border-bottom-color: var(--neon-green);
      }
      .terminal-info-box {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  activeTab = input<TabType>('monitor');
  onTabChange = output<TabType>();
}
