import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services';
import { IngredientStockService } from '../../core/services/ingredient-stock.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  recipes = signal<Recipe[]>([]);
  searchQuery = signal('');
  recipesFeasible = signal<Recipe[]>([]);

  constructor(
    private readonly recipeService: RecipeService,
    private readonly stockService: IngredientStockService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe(recipes => {
      this.recipes.set(recipes);
      this.updateRecipeAvailability();
    });

    // Subscribe to stock changes
    this.stockService.getStock().subscribe(() => {
      this.updateRecipeAvailability();
    });
  }

  private updateRecipeAvailability(): void {
    const allRecipes = this.recipes();
    
    // Recettes réalisables avec le stock actuel
    const feasible = allRecipes.filter(recipe =>
      this.stockService.canMakeRecipe(recipe.ingredients)
    );
    this.recipesFeasible.set(feasible);
  }

  openAddForm(): void {
    this.router.navigate(['/recipes/create']);
  }

  openEditForm(recipe: Recipe): void {
    this.router.navigate(['/recipes', recipe.id, 'edit']);
  }

  onDeleteRecipe(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      this.recipeService.deleteRecipe(id);
    }
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      const filtered = this.recipeService.searchRecipes(query);
      this.recipes.set(filtered);
    } else {
      this.recipeService.getRecipes().subscribe(recipes => {
        this.recipes.set(recipes);
      });
    }
  }

  get filteredRecipes(): Recipe[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.recipesFeasible();

    return this.recipesFeasible().filter(recipe =>
      recipe.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }
}

