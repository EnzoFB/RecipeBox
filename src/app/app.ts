import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RecipeSearchComponent } from './features/recipes/recipe-search/recipe-search.component';
import { RecipesComponent } from './features/recipes/recipes.component';
import { IngredientsComponent } from './features/ingredients/ingredients.component';

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
    IngredientsComponent,
    RecipeSearchComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly currentPage = signal<'recipes' | 'ingredients' | 'search'>('recipes');

  navigateTo(page: 'recipes' | 'ingredients' | 'search'): void {
    this.currentPage.set(page);
  }
}
