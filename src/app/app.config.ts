import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { appRoutes } from './app.routes';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    provideAnimations(), // Note: Keep using this until Angular v23 provides official replacement
    importProvidersFrom(
      MatDatepickerModule,
      MatNativeDateModule
    ),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' } // optionnel mais pratique

  ]
};
