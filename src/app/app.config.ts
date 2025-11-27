import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { appRoutes } from './app.routes';

/**
 * Application configuration with all providers and settings
 * Includes routing, HTTP, animations, and Material components
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Error handling
    provideBrowserGlobalErrorListeners(),
    // HTTP client
    provideHttpClient(),
    // Routing with preloading strategy
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    // Animations
    provideAnimations(),
    // Material components
    importProvidersFrom(MatDatepickerModule, MatNativeDateModule),
    // Localization
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }
  ]
};
