import { Component } from '@angular/core';
import { PanelComponent } from '../../../../shared/components/ui/panel/panel.component';

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [PanelComponent],
  templateUrl: './dashboard-settings.component.html',
  styleUrl: './dashboard-settings.component.css'
})
export class DashboardSettingsComponent {}
