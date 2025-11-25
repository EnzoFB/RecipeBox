import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../../core/models';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss'
})
export class RecipeListComponent {
  @Input() recipes: Recipe[] = [];
  @Input() searchQuery: string = '';

  editClick = output<Recipe>();
  deleteClick = output<number>();

  onEdit(recipe: Recipe): void {
    this.editClick.emit(recipe);
  }

  onDelete(id: number): void {
    this.deleteClick.emit(id);
  }

  get filteredRecipes(): Recipe[] {
    const query = this.searchQuery.toLowerCase();
    if (!query) return this.recipes;

    return this.recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.category.toLowerCase().includes(query)
    );
  }
}
