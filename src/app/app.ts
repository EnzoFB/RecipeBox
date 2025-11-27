import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

/**
 * Root application component with navigation layout
 * Provides sidebar navigation and main content router outlet
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(private readonly router: Router) {}

  /**
   * Navigate to a specific route
   * @param route - The route path to navigate to
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Check if a route is currently active
   * @param route - The route path to check
   * @returns true if the route is active
   */
  isActive(route: string): boolean {
    return this.router.url === `/${route}`;
  }
}

