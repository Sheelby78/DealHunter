import { Component, input, computed } from '@angular/core';
import { LucideRadio, LucideSend, LucideActivity } from '@lucide/angular';

export type StatCardVariant = 'green' | 'purple' | 'blue';
export type StatIconType = 'radio' | 'send' | 'activity';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [LucideRadio, LucideSend, LucideActivity],
  template: `
    <div
      class="stat-card"
      [style.border-color]="accentColor() + '40'"
      [style.box-shadow]="'0 0 15px rgba(0, 0, 0, 0.5), inset 0 0 15px ' + accentColor() + '0a'"
    >
      <div class="stat-info">
        <span class="stat-label">{{ label() }}</span>
        <span
          class="stat-value"
          [style.color]="accentColor()"
          [style.text-shadow]="'0 0 10px ' + accentColor() + '60'"
        >
          {{ value() }}
        </span>
        @if (subtext()) {
          <span class="stat-subtext">{{ subtext() }}</span>
        }
      </div>

      <div
        class="stat-icon-box"
        [style.background]="accentColor() + '15'"
        [style.border-color]="accentColor() + '30'"
        [style.color]="accentColor()"
      >
        @switch (icon()) {
          @case ('radio') {
            <svg lucideRadio [size]="24"></svg>
          }
          @case ('send') {
            <svg lucideSend [size]="24"></svg>
          }
          @default {
            <svg lucideActivity [size]="24"></svg>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .stat-card {
      background: var(--panel-bg);
      border: 1px solid;
      border-radius: 4px;
      padding: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      font-family: var(--font-heading);
    }
    .stat-subtext {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .stat-icon-box {
      padding: 0.8rem;
      border-radius: 8px;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class StatCardComponent {
  label = input<string>('');
  value = input<string | number>('');
  subtext = input<string>('');
  icon = input<StatIconType>('activity');
  variant = input<StatCardVariant>('green');

  accentColor = computed(() => {
    switch (this.variant()) {
      case 'purple':
        return '#bc13fe';
      case 'blue':
        return '#00e5ff';
      case 'green':
      default:
        return '#39ff14';
    }
  });
}
