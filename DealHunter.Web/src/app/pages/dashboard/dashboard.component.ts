import { Component, inject, signal, OnInit } from '@angular/core';
import { RulesService } from '../../features/rules/rules.service';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { ConfirmModalComponent } from '../../shared/components/ui/confirm-modal/confirm-modal.component';
import { RuleItem } from '../../shared/models/rule.model';
import { DashboardMonitorComponent } from './components/dashboard-monitor/dashboard-monitor.component';
import { DashboardLogsComponent } from './components/dashboard-logs/dashboard-logs.component';
import { DashboardSettingsComponent } from './components/dashboard-settings/dashboard-settings.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LayoutComponent,
    ConfirmModalComponent,
    DashboardMonitorComponent,
    DashboardLogsComponent,
    DashboardSettingsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly rulesService = inject(RulesService);

  activeTab = signal<'monitor' | 'logs' | 'settings'>('monitor');
  ruleToDelete = signal<RuleItem | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit(): void {
    this.rulesService.startPolling();
  }

  initiateDelete(id: string): void {
    const target = this.rulesService.rules().find(r => r.id === id);
    if (target) {
      this.ruleToDelete.set(target);
    }
  }

  async handleConfirmDelete(): Promise<void> {
    const target = this.ruleToDelete();
    if (!target) return;
    this.isDeleting.set(true);
    try {
      await this.rulesService.deleteRule(target.id);
      this.ruleToDelete.set(null);
    } catch {
      // Error handled in service
    } finally {
      this.isDeleting.set(false);
    }
  }

  getDeleteMessage(): string {
    const target = this.ruleToDelete();
    return target ? `Are you sure you want to delete the search rule for "${target.url.substring(0, 50)}..."?` : '';
  }
}
