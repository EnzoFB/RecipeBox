import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';

@Component({
  selector: 'app-recipes',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    RecipeFormComponent
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  recipes = signal<Recipe[]>([]);
  selectedRecipe = signal<Recipe | null>(null);
  showForm = signal(false);
  searchQuery = signal('');

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe(recipes => {
      this.recipes.set(recipes);
    });
  }

  openAddForm(): void {
    this.selectedRecipe.set(null);
    this.showForm.set(true);
  }

  openEditForm(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedRecipe.set(null);
  }

  onSaveRecipe(recipe: any): void {
    console.log('onSaveRecipe appelé avec:', recipe);
    if (this.selectedRecipe()) {
      console.log('Mise à jour de recette avec ID:', this.selectedRecipe()!.id!);
      this.recipeService.updateRecipe(this.selectedRecipe()!.id!, recipe);
    } else {
      console.log('Ajout nouvelle recette');
      this.recipeService.addRecipe(recipe);
    }
    this.closeForm();
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
