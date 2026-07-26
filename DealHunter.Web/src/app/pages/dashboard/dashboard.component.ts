import { Component, inject, signal, OnInit } from '@angular/core';
import { RulesService } from '../../features/rules/rules.service';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { StatCardComponent } from '../../shared/components/ui/stat-card/stat-card.component';
import { AlertPanelComponent } from '../../shared/components/ui/alert-panel/alert-panel.component';
import { PanelComponent } from '../../shared/components/ui/panel/panel.component';
import { RuleCardComponent } from '../../features/rules/rule-card/rule-card.component';
import { AddRuleFormComponent } from '../../features/rules/add-rule-form/add-rule-form.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ConfirmModalComponent } from '../../shared/components/ui/confirm-modal/confirm-modal.component';
import { RuleItem } from '../../shared/models/rule.model';
import { LucideRefreshCw, LucideX, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LayoutComponent,
    StatCardComponent,
    AlertPanelComponent,
    PanelComponent,
    RuleCardComponent,
    AddRuleFormComponent,
    ButtonComponent,
    ConfirmModalComponent,
    LucideRefreshCw,
    LucideX,
    LucidePlus
  ],
  template: `
    <app-layout [activeTab]="activeTab()" (onTabChange)="activeTab.set($event)">
      @if (activeTab() === 'monitor') {
        <div class="stat-grid">
          <app-stat-card
            label="Active Rules"
            [value]="rulesService.rules().length"
            subtext="Monitoring 24/7"
            icon="radio"
            variant="green"
          ></app-stat-card>
          <app-stat-card
            label="Alert Delivery"
            value="Telegram"
            subtext="Instant notifications"
            icon="send"
            variant="purple"
          ></app-stat-card>
          <app-stat-card
            label="Engine Status"
            value="30s Poll"
            subtext="Auto-sync active"
            icon="activity"
            variant="blue"
          ></app-stat-card>
        </div>

        @if (rulesService.error()) {
          <app-alert-panel
            [message]="rulesService.error()!"
            (onRetry)="handleRefresh()"
            [isRetrying]="isRefreshing()"
          ></app-alert-panel>
        }

        <app-panel title="Active Rules">
          <button
            panel-action
            (click)="toggleAddRule()"
            class="add-rule-toggle-btn"
            [class.open]="isAddRuleOpen()"
            [title]="isAddRuleOpen() ? 'Close Form' : 'Add Rule'"
          >
            @if (isAddRuleOpen()) {
              <svg lucideX [size]="20"></svg>
            } @else {
              <svg lucidePlus [size]="20"></svg>
            }
          </button>

          @if (isAddRuleOpen()) {
            <div class="add-rule-container">
              <app-add-rule-form (onAddRule)="handleAddRule($event)"></app-add-rule-form>
            </div>
          }

          <div class="rules-list-header">
            <span class="active-rules-count">Active rules: {{ rulesService.rules().length }}</span>

            <app-button
              variant="ghost"
              (onClick)="handleRefresh()"
              [disabled]="isRefreshing() || rulesService.loading()"
            >
              <span class="btn-inner">
                <svg lucideRefreshCw [size]="14" [class.spin-animation]="isRefreshing()"></svg>
                {{ isRefreshing() ? 'Refreshing...' : 'Refresh' }}
              </span>
            </app-button>
          </div>

          <div class="rules-list-body">
            @if (rulesService.loading() && rulesService.rules().length === 0) {
              @for (i of [1, 2, 3]; track i) {
                <div class="skeleton-card">
                  <div class="skeleton-title"></div>
                  <div class="skeleton-url"></div>
                </div>
              }
            } @else if (rulesService.rules().length === 0) {
              <p class="empty-text">No active monitoring rules found.</p>
            } @else {
              @for (rule of rulesService.rules(); track rule.id) {
                <app-rule-card [rule]="rule" (onDelete)="initiateDelete($event)"></app-rule-card>
              }
            }
          </div>
        </app-panel>
      }

      @if (activeTab() === 'logs') {
        <app-panel title="System Logs">
          <p class="log-status-text">Monitoring engine running normally.</p>
          <div class="log-console-box">
            <div>[2026-07-23 19:55:01] INFO: Engine poll tick complete. 0 new matches.</div>
            <div>[2026-07-23 19:50:01] INFO: Engine poll tick complete. 1 match detected and dispatched to Telegram.</div>
            <div>[2026-07-23 19:45:01] INFO: Engine poll tick complete. 0 new matches.</div>
          </div>
        </app-panel>
      }

      @if (activeTab() === 'settings') {
        <app-panel title="Settings">
          <p class="settings-title-text">System Configuration</p>
          <div class="settings-list-box">
            <div>Telegram Notifications: Enabled</div>
            <div>Auto-Poll Interval: 30 Seconds</div>
            <div>Theme: Neon Dark</div>
          </div>
        </app-panel>
      }

      <app-confirm-modal
        [isOpen]="!!ruleToDelete()"
        title="Delete Search Rule"
        [message]="getDeleteMessage()"
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        [isLoading]="isDeleting()"
        (onConfirm)="handleConfirmDelete()"
        (onCancel)="ruleToDelete.set(null)"
      ></app-confirm-modal>
    </app-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .add-rule-toggle-btn {
      background: rgba(57, 255, 20, 0.15);
      border: 1px solid var(--neon-green);
      color: var(--neon-green);
      width: 36px;
      height: 36px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
    }
    .add-rule-toggle-btn.open {
      background: rgba(255, 7, 58, 0.15);
      border-color: var(--neon-red);
      color: var(--neon-red);
      box-shadow: 0 0 10px rgba(255, 7, 58, 0.3);
    }
    .add-rule-container {
      overflow: hidden;
      margin-bottom: 1.2rem;
      padding-bottom: 0.8rem;
      border-bottom: 1px dashed var(--text-muted);
      animation: slideDown 0.25s ease-in-out;
    }
    .rules-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .active-rules-count {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-family: var(--font-mono);
    }
    .btn-inner {
      padding: 0.2rem 0.4rem;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .rules-list-body {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .skeleton-card {
      padding: 1.2rem;
      background: rgba(0, 0, 0, 0.4);
      border: 1px dashed var(--text-muted);
      opacity: 0.6;
    }
    .skeleton-title {
      height: 16px;
      width: 40%;
      background: var(--text-muted);
      margin-bottom: 0.8rem;
    }
    .skeleton-url {
      height: 14px;
      width: 80%;
      background: rgba(255, 255, 255, 0.1);
    }
    .empty-text {
      color: var(--text-muted);
    }
    .log-status-text {
      color: var(--neon-purple);
      margin-bottom: 0.8rem;
    }
    .log-console-box {
      background: rgba(0,0,0,0.5);
      padding: 1rem;
      border-radius: 4px;
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
      font-family: var(--font-mono);
    }
    .settings-title-text {
      color: var(--text-main);
      margin-bottom: 0.8rem;
    }
    .settings-list-box {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.8;
      font-family: var(--font-mono);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly rulesService = inject(RulesService);

  activeTab = signal<'monitor' | 'logs' | 'settings'>('monitor');
  isRefreshing = signal<boolean>(false);
  isAddRuleOpen = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  ruleToDelete = signal<RuleItem | null>(null);
  isDeleting = signal<boolean>(false);

  ngOnInit(): void {
    this.rulesService.startPolling();
  }

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
