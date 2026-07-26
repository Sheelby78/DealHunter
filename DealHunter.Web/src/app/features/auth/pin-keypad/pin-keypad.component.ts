import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-pin-keypad',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="pin-keypad">
      @for (digit of digits; track digit) {
        <app-button
          variant="ghost"
          [disabled]="disabled()"
          (onClick)="onKeyPress.emit(digit)"
          class="pin-keypad-btn"
        >
          {{ digit }}
        </app-button>
      }

      <app-button
        variant="danger"
        [disabled]="disabled()"
        (onClick)="onClear.emit()"
        class="pin-keypad-action-btn"
      >
        CLR
      </app-button>

      <app-button
        variant="ghost"
        [disabled]="disabled()"
        (onClick)="onKeyPress.emit('0')"
        class="pin-keypad-btn"
      >
        0
      </app-button>

      <app-button
        variant="primary"
        [disabled]="disabled()"
        (onClick)="onSubmit.emit()"
        class="pin-keypad-action-btn"
      >
        AUTH
      </app-button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .pin-keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.8rem;
      max-width: 280px;
      margin: 0 auto;
    }
  `]
})
export class PinKeypadComponent {
  disabled = input<boolean>(false);
  onKeyPress = output<string>();
  onClear = output<void>();
  onSubmit = output<void>();

  digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
}
