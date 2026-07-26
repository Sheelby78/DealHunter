import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideLucideIcons,
  LucidePlus,
  LucideExternalLink,
  LucideTrash2,
  LucideRefreshCw,
  LucideX,
  LucideRadio,
  LucideSend,
  LucideActivity,
  LucideLock,
  LucideShieldAlert,
  LucideWifiOff,
  LucideAlertTriangle,
  LucideChevronUp,
  LucideChevronDown,
  LucideLogOut,
  LucideTerminal,
  LucideSliders,
  LucideShieldCheck
} from '@lucide/angular';
import { routes } from './app.routes';
import { authInterceptor } from './core/api/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideLucideIcons(
      LucidePlus,
      LucideExternalLink,
      LucideTrash2,
      LucideRefreshCw,
      LucideX,
      LucideRadio,
      LucideSend,
      LucideActivity,
      LucideLock,
      LucideShieldAlert,
      LucideWifiOff,
      LucideAlertTriangle,
      LucideChevronUp,
      LucideChevronDown,
      LucideLogOut,
      LucideTerminal,
      LucideSliders,
      LucideShieldCheck
    )
  ]
};
