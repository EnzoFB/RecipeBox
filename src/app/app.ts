import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipeSearchComponent } from './features/recipes/recipe-search/recipe-search.component';
import { RecipesComponent } from './features/recipes/recipes.component';
import { RecipesManagementComponent } from './features/recipes/recipes-management/recipes-management.component';
import { IngredientsComponent } from './features/ingredients/ingredients.component';
import { StockComponent } from './features/ingredients/stock/stock.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RecipesComponent,
    RecipesManagementComponent,
    IngredientsComponent,
    StockComponent,
    RecipeSearchComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentPage = signal<'recipes' | 'recipes-management' | 'ingredients' | 'stock' | 'search'>('recipes');

  navigateTo(page: 'recipes' | 'recipes-management' | 'ingredients' | 'stock' | 'search'): void {
    this.currentPage.set(page);
  }
}

