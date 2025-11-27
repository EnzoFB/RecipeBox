import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { Recipe } from '../../../core/models';
import { RecipeService } from '../../../core/services';
import { BaseCrudManagementComponent } from '../../../shared/components';

@Component({
  selector: 'app-recipes-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './recipes-management.component.html',
  styleUrl: './recipes-management.component.scss'
})
export class RecipesManagementComponent extends BaseCrudManagementComponent<Recipe> implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'category', 'time', 'actions'];

  constructor(
    private readonly recipeService: RecipeService,
    router: Router
  ) {
    super(router);
  }

  protected loadData(): void {
    this.setLoading(true);
    this.recipeService
      .getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recipes) => {
          this.setItems(recipes);
          this.setLoading(false);
          this.clearError();
        },
        error: (error) => {
          this.setError('Erreur lors du chargement des recettes');
          this.setLoading(false);
          console.error('Error loading recipes:', error);
        }
      });
  }

  protected filter(recipes: Recipe[], query: string): Recipe[] {
    return recipes.filter(recipe =>
      recipe.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }

  openAddForm(): void {
    this.navigateToCreate('/recipes/create');
  }

  openEditForm(recipe: Recipe): void {
    this.navigateToEdit('/recipes', recipe.id);
  }

  onDeleteRecipe(id: number, name?: string): void {
    if (this.confirmDeletion(name)) {
      this.recipeService.deleteRecipe(id);
      this.loadData();
    }
  }
}


