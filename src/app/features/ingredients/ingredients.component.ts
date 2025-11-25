import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngredientFormComponent } from './ingredient-form/ingredient-form.component';
import { Ingredient, INGREDIENT_CATEGORIES } from '../../core/models';
import { IngredientService } from '../../core/services';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule, IngredientFormComponent],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss'
})
export class IngredientsComponent implements OnInit {
  ingredients = signal<Ingredient[]>([]);
  selectedIngredient = signal<Ingredient | null>(null);
  showForm = signal(false);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  categories = INGREDIENT_CATEGORIES;

  constructor(private readonly ingredientService: IngredientService) {}

  ngOnInit(): void {
    this.ingredientService.getIngredients().subscribe(ingredients => {
      this.ingredients.set(ingredients);
    });
  }

  openAddForm(): void {
    this.selectedIngredient.set(null);
    this.showForm.set(true);
  }

  openEditForm(ingredient: Ingredient): void {
    this.selectedIngredient.set(ingredient);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedIngredient.set(null);
  }

  onSaveIngredient(ingredient: Omit<Ingredient, 'id'>): void {
    if (this.selectedIngredient()) {
      this.ingredientService.updateIngredient(this.selectedIngredient()!.id!, ingredient);
    } else {
      this.ingredientService.addIngredient(ingredient);
    }
    this.closeForm();
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
