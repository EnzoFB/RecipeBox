import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../../core/models';
import { IngredientService, UnitService } from '../../../core/services';

@Component({
  selector: 'app-ingredients-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './ingredients-management.component.html',
  styleUrl: './ingredients-management.component.scss'
})
export class IngredientsManagementComponent implements OnInit, OnDestroy {
  ingredients = signal<Ingredient[]>([]);
  searchQuery = signal('');
  categories = INGREDIENT_CATEGORIES;
  private units: Map<number, Unit> = new Map();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly ingredientService: IngredientService,
    private readonly unitService: UnitService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.unitService.getUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe(units => {
        this.units = new Map(units.map(u => [u.id!, u]));
      });

    this.ingredientService.getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ingredients => {
        this.ingredients.set(ingredients);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.ingredients.update(ingredients => 
        ingredients.filter(i => i.id !== id)
      );
    }
  }

  onSearch(): void {
    // Le filtre est appliqué dans le getter
  }

  getUnitName(unitId?: number): string {
    if (!unitId) return '-';
    return this.units.get(unitId)?.symbol || '-';
  }

  get filteredIngredients(): Ingredient[] {
    const query = this.searchQuery().toLowerCase();

    if (!query) {
      return this.ingredients();
    }

    return this.ingredients().filter(ingredient => {
      const name = ingredient.name?.toLowerCase() || '';
      const category = ingredient.category?.toLowerCase() || '';
      return name.includes(query) || category.includes(query);
    });
  }
}
