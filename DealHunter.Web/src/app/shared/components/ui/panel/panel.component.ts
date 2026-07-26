import { Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: true,
  template: `
    <section class="panel">
      @if (title() || hasAction()) {
        <div class="panel-header">
          @if (title()) {
            <h2 class="panel-title">&gt; {{ title() }}</h2>
          }
          <div class="panel-action">
            <ng-content select="[panel-action]"></ng-content>
          </div>
        </div>
      }
      <ng-content></ng-content>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .panel-title {
      margin: 0;
    }
  `]
})
export class PanelComponent {
  title = input<string>('');
  hasAction = input<boolean>(false);
}
