import { Component, input, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar [activeTab]="activeTab()" (onTabChange)="onTabChange.emit($event)"></app-sidebar>
      <div class="main-scroll-area">
        <app-header></app-header>
        <main class="main-content">
          <ng-content></ng-content>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
  `]
})
export class LayoutComponent {
  activeTab = input<string>('monitor');
  onTabChange = output<string>();
}
