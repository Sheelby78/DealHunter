import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RuleItem } from '../../shared/models/rule.model';
import { AuthService } from '../../core/auth/auth.service';
import { timer, Subscription, switchMap, filter, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RulesService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly rules = signal<RuleItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private pollingSub?: Subscription;

  constructor() {
    this.startPolling();
  }

  startPolling(): void {
    if (this.pollingSub) {
      return;
    }
    this.pollingSub = timer(0, 30000).pipe(
      filter(() => this.authService.isAuthenticated()),
      switchMap(() => {
        this.loading.set(true);
        return this.http.get<RuleItem[]>('/api/rules');
      })
    ).subscribe({
      next: (data) => {
        this.rules.set(data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to fetch rules');
      }
    });
  }

  stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  async fetchRules(): Promise<void> {
    if (!this.authService.isAuthenticated()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<RuleItem[]>('/api/rules'));
      this.rules.set(data);
    } catch (err) {
      this.error.set('Failed to fetch rules');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async createRule(url: string, maxPrice: number | null): Promise<RuleItem> {
    this.error.set(null);
    try {
      const newRule = await firstValueFrom(this.http.post<RuleItem>('/api/rules', { url, maxPrice }));
      this.rules.update(list => [...list, newRule]);
      return newRule;
    } catch (err) {
      this.error.set('Failed to create rule');
      throw err;
    }
  }

  async deleteRule(id: string): Promise<void> {
    this.error.set(null);
    const previousRules = this.rules();
    this.rules.update(list => list.filter(r => r.id !== id));
    try {
      await firstValueFrom(this.http.delete<void>(`/api/rules/${encodeURIComponent(id)}`));
    } catch (err) {
      this.rules.set(previousRules);
      this.error.set('Failed to delete rule');
      throw err;
    }
  }
}
