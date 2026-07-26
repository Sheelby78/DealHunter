import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeVariant = 'green' | 'purple' | 'red';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="cyberpunk-badge" [ngClass]="variant()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class BadgeComponent {
  variant = input<BadgeVariant>('green');
}
