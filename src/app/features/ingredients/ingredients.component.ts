import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IngredientFormComponent } from './ingredient-form/ingredient-form.component';
import { Ingredient, INGREDIENT_CATEGORIES } from '../../core/models';
import { IngredientService } from '../../core/services';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss'
})
export class IngredientsComponent implements OnInit {
  ingredients = signal<Ingredient[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  categories = INGREDIENT_CATEGORIES;

  constructor(
    private readonly ingredientService: IngredientService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ingredientService.getIngredients().subscribe(ingredients => {
      this.ingredients.set(ingredients);
    });
  }

  openAddForm(): void {
    this.dialog.open(IngredientFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { ingredient: null }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.ingredientService.addIngredient(result);
      }
    });
  }

  openEditForm(ingredient: Ingredient): void {
    this.dialog.open(IngredientFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { ingredient }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.ingredientService.updateIngredient(ingredient.id!, result);
      }
    });
  }

  onDeleteIngredient(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) {
      this.ingredientService.deleteIngredient(id);
    }
  }

  onSearch(): void {
    this.selectedCategory.set('');
  }

  onCategoryChange(): void {
    this.searchQuery.set('');
  }

  get filteredIngredients(): Ingredient[] {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    let filtered = this.ingredients();

    if (query) {
      filtered = filtered.filter(ingredient => {
        const name = ingredient.name?.toLowerCase() || '';
        const cat = ingredient.category?.toLowerCase() || '';
        return name.includes(query) || cat.includes(query);
      });
    }

    if (category) {
      filtered = filtered.filter(ingredient => ingredient.category === category);
    }

    return filtered;
  }
}
