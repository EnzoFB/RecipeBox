import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';

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
    MatDialogModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  recipes = signal<Recipe[]>([]);
  searchQuery = signal('');

  constructor(
    private readonly recipeService: RecipeService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe(recipes => {
      this.recipes.set(recipes);
    });
  }

  openAddForm(): void {
    this.dialog.open(RecipeFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { recipe: null }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.recipeService.addRecipe(result);
      }
    });
  }

  openEditForm(recipe: Recipe): void {
    this.dialog.open(RecipeFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { recipe }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.recipeService.updateRecipe(recipe.id!, result);
      }
    });
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
    if (!query) return this.recipes();

    return this.recipes().filter(recipe =>
      recipe.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }
}
