import { Component, input } from '@angular/core';

@Component({
  selector: 'app-glitch-text',
  standalone: true,
  template: `
    @switch (tag()) {
      @case ('h1') {
        <h1 class="glitch" [attr.data-text]="text()">{{ text() }}</h1>
      }
      @case ('h2') {
        <h2 class="glitch" [attr.data-text]="text()">{{ text() }}</h2>
      }
      @case ('h3') {
        <h3 class="glitch" [attr.data-text]="text()">{{ text() }}</h3>
      }
      @default {
        <span class="glitch" [attr.data-text]="text()">{{ text() }}</span>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .glitch {
      margin: 0;
    }
  `]
})
export class GlitchTextComponent {
  text = input<string>('');
  tag = input<'h1' | 'h2' | 'h3' | 'span'>('h1', { alias: 'as' });
}
