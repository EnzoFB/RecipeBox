import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Recipe } from '../../../core/models';
import { RecipeService } from '../../../core/services';

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
    MatTooltipModule
  ],
  templateUrl: './recipes-management.component.html',
  styleUrl: './recipes-management.component.scss'
})
export class RecipesManagementComponent implements OnInit, OnDestroy {
  recipes = signal<Recipe[]>([]);
  searchQuery = signal('');
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly recipeService: RecipeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecipes(): void {
    this.recipeService.getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(recipes => {
        this.recipes.set(recipes);
      });
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
      this.loadRecipes();
    }
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      const filtered = this.recipeService.searchRecipes(query);
      this.recipes.set(filtered);
    } else {
      this.loadRecipes();
    }
  }

  get filteredRecipes(): Recipe[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.recipes();

    return this.recipes().filter(recipe =>
      recipe.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }
}

