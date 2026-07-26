import { Component, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { InputComponent } from '../../../shared/components/ui/input/input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { LucidePlus } from '@lucide/angular';

function olxUrlValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val || typeof val !== 'string') return null;
  if (!val.includes('olx.pl')) {
    return { invalidOlxUrl: true };
  }
  return null;
}

@Component({
  selector: 'app-add-rule-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent, LucidePlus],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleSubmit()">
      <app-input
        id="url"
        label="OLX Search URL"
        placeholder="https://www.olx.pl/d/oferta/..."
        formControlName="url"
        [error]="getErrorMessage()"
      ></app-input>

      <app-input
        id="max-price"
        label="Max Price (PLN, optional)"
        type="number"
        placeholder="e.g. 1500"
        formControlName="maxPrice"
      ></app-input>

      <app-button type="submit" variant="primary" class="full-width-mobile">
        <span class="btn-content">
          <svg lucidePlus [size]="18"></svg> Add Rule
        </span>
      </app-button>
    </form>
  `,
  styles: [`
    :host {
      display: block;
    }
    .btn-content {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }
  `]
})
export class AddRuleFormComponent {
  onAddRule = output<{ url: string; maxPrice: number | null }>();
  customError = signal<string>('');

  form = new FormGroup({
    url: new FormControl('', { nonNullable: true, validators: [Validators.required, olxUrlValidator] }),
    maxPrice: new FormControl<string | number>('', { nonNullable: true })
  });

  getErrorMessage(): string {
    if (this.customError()) return this.customError();
    const ctrl = this.form.controls.url;
    if (ctrl.touched && ctrl.invalid) {
      if (ctrl.hasError('required')) return 'Target URL is required';
      if (ctrl.hasError('invalidOlxUrl')) return 'URL must be a valid OLX.pl link';
    }
    return '';
  }

  handleSubmit(): void {
    this.customError.set('');
    if (this.form.invalid) {
      this.form.controls.url.markAsTouched();
      if (this.form.controls.url.hasError('required')) {
        this.customError.set('Target URL is required');
      } else if (this.form.controls.url.hasError('invalidOlxUrl')) {
        this.customError.set('URL must be a valid OLX.pl link');
      }
      return;
    }

    const rawUrl = this.form.controls.url.value.trim();
    const rawPrice = this.form.controls.maxPrice.value;
    const parsedPrice = rawPrice !== '' && rawPrice !== null && rawPrice !== undefined ? parseFloat(String(rawPrice)) : null;

    this.onAddRule.emit({ url: rawUrl, maxPrice: isNaN(parsedPrice as number) ? null : parsedPrice });
    this.form.reset({ url: '', maxPrice: '' });
  }
}
