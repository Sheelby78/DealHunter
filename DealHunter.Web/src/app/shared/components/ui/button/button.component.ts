import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant = 'primary' | 'danger' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick.emit($event)"
      class="cyberpunk-btn"
      [ngClass]="variant()"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  onClick = output<MouseEvent>();
}
