import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../core/models';
import { IngredientService, UnitService } from '../../core/services';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss'
})
export class IngredientsComponent implements OnInit {
  ingredients = signal<Ingredient[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  categories = INGREDIENT_CATEGORIES;
  private units: Map<number, Unit> = new Map();

  constructor(
    private readonly ingredientService: IngredientService,
    private readonly unitService: UnitService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.unitService.getUnits().subscribe(units => {
      this.units = new Map(units.map(u => [u.id!, u]));
    });

    this.ingredientService.getIngredients().subscribe(ingredients => {
      this.ingredients.set(ingredients);
    });
  }

  openAddForm(): void {
    this.router.navigate(['/ingredients/create']);
  }

  openEditForm(ingredient: Ingredient): void {
    this.router.navigate(['/ingredients', ingredient.id, 'edit']);
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

  getUnitName(unitId?: number): string {
    if (!unitId) return '-';
    return this.units.get(unitId)?.symbol || '-';
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
