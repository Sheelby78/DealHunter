import { Component, inject, signal, output } from '@angular/core';
import { RulesService } from '../../../../features/rules/rules.service';
import { StatCardComponent } from '../../../../shared/components/ui/stat-card/stat-card.component';
import { AlertPanelComponent } from '../../../../shared/components/ui/alert-panel/alert-panel.component';
import { PanelComponent } from '../../../../shared/components/ui/panel/panel.component';
import { RuleCardComponent } from '../../../../features/rules/rule-card/rule-card.component';
import { AddRuleFormComponent } from '../../../../features/rules/add-rule-form/add-rule-form.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { LucideRefreshCw, LucideX, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-dashboard-monitor',
  standalone: true,
  imports: [
    StatCardComponent,
    AlertPanelComponent,
    PanelComponent,
    RuleCardComponent,
    AddRuleFormComponent,
    ButtonComponent,
    LucideRefreshCw,
    LucideX,
    LucidePlus
  ],
  templateUrl: './dashboard-monitor.component.html',
  styleUrl: './dashboard-monitor.component.css'
})
export class DashboardMonitorComponent {
  readonly rulesService = inject(RulesService);

  readonly onInitiateDelete = output<string>();

  isRefreshing = signal<boolean>(false);
  isAddRuleOpen = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

  toggleAddRule(): void {
    this.isAddRuleOpen.update(v => !v);
  }

  async handleRefresh(): Promise<void> {
    this.isRefreshing.set(true);
    try {
      await this.rulesService.fetchRules();
    } catch {
      // Error is handled in service
    } finally {
      this.isRefreshing.set(false);
    }
  }

  async handleAddRule(event: { url: string; maxPrice: number | null }): Promise<void> {
    try {
      await this.rulesService.createRule(event.url, event.maxPrice);
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        this.isAddRuleOpen.set(false);
      }
    } catch {
      // Error handled in service
    }
  }
}
