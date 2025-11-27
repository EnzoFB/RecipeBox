import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { Recipe, ShoppingListItem } from '../../../core/models';
import { RecipeService } from '../../../core/services/recipe.service';
import { IngredientStockService } from '../../../core/services/ingredient-stock.service';
import { IngredientService } from '../../../core/services/ingredient.service';
import { ShoppingListService } from '../../../core/services/shopping-list.service';
import { MissingIngredientsModalComponent } from './missing-ingredients-modal.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type AvailabilityStatus = '✅' | '🟡' | '🔴';

interface IngredientWithStock {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  available: number;
  status: AvailabilityStatus;
  missing: number;
}

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe: Recipe | null = null;
  portions = 1;
  ingredientsWithStock: IngredientWithStock[] = [];
  overallStatus: AvailabilityStatus = '✅';
  showMissingOptions = false;
  missingIngredientsCount = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly ingredientNameCache = new Map<number, string>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly recipeService: RecipeService,
    private readonly stockService: IngredientStockService,
    private readonly ingredientService: IngredientService,
    private readonly shoppingListService: ShoppingListService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Load all ingredient names into cache
    this.ingredientService.getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ingredients => {
        for (const ing of ingredients) {
          if (ing.id !== undefined) {
            this.ingredientNameCache.set(ing.id, ing.name);
          }
        }
      });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          const numId = Number.parseInt(id, 10);
          this.recipe = this.recipeService.getRecipeById(numId) || null;
          if (this.recipe) {
            this.updateRecipeAvailability();
          }
        }
      });

    // Subscribe to stock changes to update availability
    this.stockService.getStock()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.recipe) {
          this.updateRecipeAvailability();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPortionsChange(): void {
    this.updateRecipeAvailability();
  }

  private updateRecipeAvailability(): void {
    if (!this.recipe) return;

    const scaledIngredients = this.recipe.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity * this.portions,
      unit: ing.unit
    }));

    const availability = this.stockService.calculateRecipeAvailability(scaledIngredients);
    this.overallStatus = availability.status;
    this.missingIngredientsCount = availability.missingIngredients.length;

    // Build ingredients list with stock info
    this.ingredientsWithStock = this.recipe.ingredients.map(ing => {
      const scaled = ing.quantity * this.portions;
      const available = this.stockService.getTotalQuantityInStock(ing.ingredientId, ing.unit);
      const missing = Math.max(0, scaled - available);
      
      let status: AvailabilityStatus;
      if (available >= scaled) {
        // Assez d'ingrédient
        status = '✅';
      } else if (available > 0) {
        // Partiellement disponible
        status = '🟡';
      } else {
        // Pas d'ingrédient du tout
        status = '🔴';
      }

      return {
        ingredientId: ing.ingredientId,
        ingredientName: this.getIngredientNameById(ing.ingredientId),
        quantity: scaled,
        unit: ing.unit,
        available,
        status,
        missing
      };
    });

    this.showMissingOptions = availability.missingIngredients.length > 0;
  }

  private getIngredientNameById(id: number): string {
    return this.ingredientNameCache.get(id) || `Ingrédient ${id}`;
  }

  addMissingToShoppingList(ingredient: IngredientWithStock): void {
    const shoppingItem: Omit<ShoppingListItem, 'id' | 'createdAt'> = {
      ingredientId: ingredient.ingredientId,
      quantityNeeded: ingredient.missing,
      unit: ingredient.unit,
      sourceRecipeId: this.recipe?.id,
      sourceRecipeName: this.recipe?.name
    };

    this.shoppingListService.addItem(shoppingItem);
    alert(`✅ ${ingredient.ingredientName} ajouté à la liste de courses`);
  }

  addAllMissingToShoppingList(): void {
    const missingItems = this.ingredientsWithStock
      .filter(ing => ing.missing > 0)
      .map(ing => ({
        ingredientId: ing.ingredientId,
        quantityNeeded: ing.missing,
        unit: ing.unit,
        sourceRecipeId: this.recipe?.id,
        sourceRecipeName: this.recipe?.name
      }));

    if (missingItems.length > 0) {
      this.shoppingListService.addBulkItems(missingItems);
      alert(`✅ ${missingItems.length} ingrédient(s) ajouté(s) à la liste de courses`);
    }
  }

  makeRecipe(): void {
    if (!this.recipe) return;

    // If there are missing ingredients, show modal
    if (this.missingIngredientsCount > 0) {
      const missingData = this.ingredientsWithStock
        .filter(ing => ing.missing > 0)
        .map(ing => ({
          ingredientName: ing.ingredientName,
          missing: ing.missing,
          unit: ing.unit
        }));

      const dialogRef = this.dialog.open(MissingIngredientsModalComponent, {
        width: '500px',
        data: missingData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'add-to-shopping-list') {
          this.addAllMissingToShoppingList();
        } else if (result === 'continue-anyway') {
          this.executeRecipe();
        }
      });
    } else {
      // All ingredients available, execute recipe directly
      this.executeRecipe();
    }
  }

  private executeRecipe(): void {
    if (!this.recipe) return;

    // Deduct from stock
    const scaledIngredients = this.recipe.ingredients.map(ing => ({
      ingredientId: ing.ingredientId,
      quantity: ing.quantity * this.portions,
      unit: ing.unit
    }));

    this.stockService.deductRecipeIngredients(scaledIngredients);
    alert(`✅ ${this.portions} portion(s) de "${this.recipe.name}" réalisée(s)!\nLes ingrédients ont été déduits du stock.`);
    this.router.navigate(['/recipes/manage']);
  }

  goBack(): void {
    this.router.navigate(['/recipes/manage']);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      '✅': '✓',
      '🟡': '⚠',
      '🔴': '✕'
    };
    return icons[status] || status;
  }

  // Expose Math for template
  Math = Math;
}
