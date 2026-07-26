import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideChevronUp, LucideChevronDown } from '@lucide/angular';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [LucideChevronUp, LucideChevronDown],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-container">
      @if (label()) {
        <label [for]="id()" class="input-label">{{ label() }}</label>
      }
      <div class="input-wrapper">
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          class="cyberpunk-input"
          [class.error]="!!error()"
        />
        @if (type() === 'number') {
          <div class="stepper-controls">
            <button type="button" tabindex="-1" class="stepper-btn" (click)="step('up')">
              <svg lucideIcon="chevron-up" [size]="14"></svg>
            </button>
            <button type="button" tabindex="-1" class="stepper-btn" (click)="step('down')">
              <svg lucideIcon="chevron-down" [size]="14"></svg>
            </button>
          </div>
        }
      </div>
      @if (error()) {
        <span class="input-error">{{ error() }}</span>
      }
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      width: 100%;
    }
    .input-label {
      color: var(--neon-purple);
      font-size: 1rem;
      font-family: var(--font-mono);
      text-transform: uppercase;
    }
    .input-wrapper {
      position: relative;
      width: 100%;
    }
    .cyberpunk-input {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid var(--text-muted);
      color: var(--neon-green);
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 16px;
      outline: none;
      transition: all 0.3s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .cyberpunk-input:focus {
      border-color: var(--neon-green);
      box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
    }
    .cyberpunk-input.error {
      border-color: var(--neon-red);
    }
    .cyberpunk-input.error:focus {
      border-color: var(--neon-red);
      box-shadow: 0 0 15px rgba(255, 7, 58, 0.4);
    }
    input[type="number"] {
      padding-right: 3rem;
    }
    .stepper-controls {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stepper-btn {
      background: rgba(188, 19, 254, 0.15);
      border: 1px solid var(--neon-purple);
      color: var(--neon-purple);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 18px;
      cursor: pointer;
      padding: 0;
      outline: none;
      transition: all 0.2s ease;
    }
    .stepper-btn:hover {
      background: var(--neon-purple);
      color: #000;
      box-shadow: 0 0 10px var(--neon-purple);
    }
    .input-error {
      color: var(--neon-red);
      font-size: 0.85rem;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>('');
  error = input<string>('');
  id = input<string>('');
  type = input<'text' | 'number' | 'password'>('text');
  placeholder = input<string>('');
  stepAmount = input<number>(100);

  value = signal<string | number>('');
  disabled = signal<boolean>(false);

  private onChange: (value: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  writeValue(val: any): void {
    if (val !== undefined && val !== null) {
      this.value.set(val);
    } else {
      this.value.set('');
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const finalVal = this.type() === 'number' ? (parseFloat(val) || 0) : val;
    this.value.set(val);
    this.onChange(finalVal);
  }

  onBlur(): void {
    this.onTouchedCallback();
  }

  step(direction: 'up' | 'down'): void {
    if (this.disabled()) return;
    const currentVal = parseFloat(String(this.value())) || 0;
    const step = this.stepAmount();
    const newVal = direction === 'up' ? currentVal + step : Math.max(0, currentVal - step);
    this.value.set(newVal);
    this.onChange(newVal);
  }
}
