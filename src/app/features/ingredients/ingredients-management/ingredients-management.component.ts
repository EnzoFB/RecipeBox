import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { takeUntil } from 'rxjs';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../../core/models';
import { IngredientService, UnitService } from '../../../core/services';
import { BaseCrudManagementComponent } from '../../../shared/components';

@Component({
  selector: 'app-ingredients-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './ingredients-management.component.html',
  styleUrl: './ingredients-management.component.scss'
})
export class IngredientsManagementComponent extends BaseCrudManagementComponent<Ingredient> implements OnInit {
  displayedColumns: string[] = ['image', 'name', 'category', 'unit', 'calories', 'actions'];
  categories = INGREDIENT_CATEGORIES;

  private units: Map<number, Unit> = new Map();

  constructor(
    private readonly ingredientService: IngredientService,
    private readonly unitService: UnitService,
    router: Router
  ) {
    super(router);
  }

  protected loadData(): void {
    this.setLoading(true);

    // Load units first
    this.unitService
      .getUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units) => {
          this.units = new Map(units.map(u => [u.id!, u]));
          this.loadIngredients();
        },
        error: (error) => {
          this.setError('Erreur lors du chargement des unités');
          this.setLoading(false);
          console.error('Error loading units:', error);
        }
      });
  }

  private loadIngredients(): void {
    this.ingredientService
      .getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ingredients) => {
          this.setItems(ingredients);
          this.setLoading(false);
          this.clearError();
        },
        error: (error) => {
          this.setError('Erreur lors du chargement des ingrédients');
          this.setLoading(false);
          console.error('Error loading ingredients:', error);
        }
      });
  }

  protected filter(ingredients: Ingredient[], query: string): Ingredient[] {
    return ingredients.filter(ingredient => {
      const name = ingredient.name?.toLowerCase() || '';
      const category = ingredient.category?.toLowerCase() || '';
      return name.includes(query) || category.includes(query);
    });
  }

  openAddForm(): void {
    this.navigateToCreate('/ingredients/create');
  }

  openEditForm(ingredient: Ingredient): void {
    this.navigateToEdit('/ingredients', ingredient.id);
  }

  onDeleteIngredient(id: number, name?: string): void {
    if (this.confirmDeletion(name)) {
      this.ingredientService.deleteIngredient(id);
      this.loadData();
    }
  }

  getUnitName(unitId?: number): string {
    if (!unitId) return '-';
    return this.units.get(unitId)?.symbol || '-';
  }
}

