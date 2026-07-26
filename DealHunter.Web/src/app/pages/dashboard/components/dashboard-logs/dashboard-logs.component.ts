import { Component } from '@angular/core';
import { PanelComponent } from '../../../../shared/components/ui/panel/panel.component';

@Component({
  selector: 'app-dashboard-logs',
  standalone: true,
  imports: [PanelComponent],
  templateUrl: './dashboard-logs.component.html',
  styleUrl: './dashboard-logs.component.css'
})
export class DashboardLogsComponent {}
