import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const PIN_STORAGE_KEY = 'dealhunter_pin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly pin = signal<string | null>(this.getInitialPin());
  readonly isAuthenticated = computed(() => Boolean(this.pin()));

  private getInitialPin(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(PIN_STORAGE_KEY);
    }
    return null;
  }

  async login(candidatePin: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get('/api/rules', {
          headers: { 'X-PIN': candidatePin },
          observe: 'response'
        })
      );

      if (response && response.status === 200) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(PIN_STORAGE_KEY, candidatePin);
        }
        this.pin.set(candidatePin);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return false;
      }
      throw err;
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(PIN_STORAGE_KEY);
    }
    this.pin.set(null);
    this.router.navigate(['/login']);
  }
}
