import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../../../core/models/recipe.model';
import { RecipeService } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-search.component.html',
  styleUrl: './recipe-search.component.scss'
})
export class RecipeSearchComponent implements OnInit {
  recipes = signal<Recipe[]>([]);
  searchQuery = signal('');
  searchBy = signal<'name' | 'category' | 'all'>('all');
  selectedRecipe = signal<Recipe | null>(null);

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe(recipes => {
      this.recipes.set(recipes);
    });
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (!query.trim()) {
      this.recipeService.getRecipes().subscribe(recipes => {
        this.recipes.set(recipes);
      });
      return;
    }

    const searchBy = this.searchBy();
    const lowerQuery = query.toLowerCase();
    let filtered: Recipe[] = [];

    if (searchBy === 'name') {
      filtered = this.recipes().filter(recipe =>
        recipe.name.toLowerCase().includes(lowerQuery)
      );
    } else if (searchBy === 'category') {
      filtered = this.recipes().filter(recipe =>
        recipe.category.toLowerCase().includes(lowerQuery)
      );
    } else {
      filtered = this.recipes().filter(recipe =>
        recipe.name.toLowerCase().includes(lowerQuery) ||
        recipe.category.toLowerCase().includes(lowerQuery) ||
        recipe.description.toLowerCase().includes(lowerQuery)
      );
    }

    this.recipes.set(filtered);
  }

  viewRecipe(recipe: Recipe): void {
    this.selectedRecipe.set(this.selectedRecipe() === recipe ? null : recipe);
  }

  closeDetail(): void {
    this.selectedRecipe.set(null);
  }

  getTotalTime(recipe: Recipe): number {
    return recipe.prepTime + recipe.cookTime;
  }

  getIngredientName(ingredientId: number): string {
    // This will need to be implemented with ingredient service
    return `Ingrédient ${ingredientId}`;
  }
}
