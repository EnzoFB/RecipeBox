import { Component, OnInit, signal, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Recipe } from '../../core/models';
import { Ingredient } from '../../core/models/ingredient.model';
import { RecipeService, IngredientService } from '../../core/services';
import { IngredientStockService } from '../../core/services/ingredient-stock.service';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { ShoppingListItem } from '../../core/models/shopping-list.model';
import { CartModalComponent } from './cart-modal/cart-modal.component';

// Types pour les pipes
interface ExpiringIngredient {
  ingredientId: number;
  ingredientName: string;
  daysToExpiry: number;
}

interface MissingIngredient {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  available: number;
  missing: number;
}

interface RecipeWithStatus extends Recipe {
  isReady: boolean;
  hasExpiringIngredients: boolean;
  expiringIngredients: ExpiringIngredient[];
  missingIngredients: MissingIngredient[];
}

// Pipes
@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(recipes: RecipeWithStatus[], isReady: boolean): RecipeWithStatus[] {
    return recipes.filter(recipe => recipe.isReady === isReady);
  }
}

@Pipe({
  name: 'sliceByExpiry',
  standalone: true
})
export class SliceByExpiryPipe implements PipeTransform {
  transform(recipes: RecipeWithStatus[]): RecipeWithStatus[] {
    // Trier pour mettre les recettes avec ingrédients bientôt périmés en premier
    return [...recipes].sort((a, b) => {
      if (a.hasExpiringIngredients && !b.hasExpiringIngredients) return -1;
      if (!a.hasExpiringIngredients && b.hasExpiringIngredients) return 1;
      
      // Si les deux ont des ingrédients bientôt périmés, mettre les plus urgents en premier
      if (a.hasExpiringIngredients && b.hasExpiringIngredients) {
        const minDaysA = Math.min(...a.expiringIngredients.map((e: ExpiringIngredient) => e.daysToExpiry));
        const minDaysB = Math.min(...b.expiringIngredients.map((e: ExpiringIngredient) => e.daysToExpiry));
        return minDaysA - minDaysB;
      }
      
      return 0;
    });
  }
}

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
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    FilterByStatusPipe,
    SliceByExpiryPipe
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  recipes = signal<RecipeWithStatus[]>([]);
  searchQuery = signal('');
  ingredients = signal<Ingredient[]>([]);

  constructor(
    private readonly recipeService: RecipeService,
    private readonly stockService: IngredientStockService,
    private readonly ingredientService: IngredientService,
    private readonly shoppingListService: ShoppingListService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Load all ingredients
    this.ingredientService.getIngredients().subscribe(ingredients => {
      this.ingredients.set(ingredients);
      this.updateAllRecipes();
    });

    // Subscribe to recipes
    this.recipeService.getRecipes().subscribe(() => {
      this.updateAllRecipes();
    });

    // Subscribe to stock changes and update status
    this.stockService.getStock().subscribe(() => {
      this.updateAllRecipes();
    });
  }

  private updateAllRecipes(): void {
    this.recipeService.getRecipes().subscribe(allRecipes => {
      const recipesWithStatus: RecipeWithStatus[] = allRecipes.map(recipe => {
        const isReady = this.stockService.canMakeRecipe(recipe.ingredients);
        const availability = this.stockService.calculateRecipeAvailability(recipe.ingredients);
        const missingIngredients = this.enrichMissingIngredients(availability.missingIngredients);
        const expiringData = this.getExpiringIngredients(recipe.ingredients);
        
        return {
          ...recipe,
          isReady,
          hasExpiringIngredients: expiringData.hasExpiring,
          expiringIngredients: expiringData.expiringList,
          missingIngredients
        };
      });
      this.recipes.set(recipesWithStatus);
    });
  }

  private getExpiringIngredients(recipeIngredients: Array<{ ingredientId: number; quantity: number; unit: string }>): { hasExpiring: boolean; expiringList: Array<{ ingredientId: number; ingredientName: string; daysToExpiry: number }> } {
    const expiringList: Array<{ ingredientId: number; ingredientName: string; daysToExpiry: number }> = [];
    const stockWithExpiry = this.stockService.getStockWithExpiry();
    
    for (const recipeIng of recipeIngredients) {
      const expiringItems = stockWithExpiry.filter(item => 
        item.ingredientId === recipeIng.ingredientId && 
        !item.isExpired &&
        item.daysToExpiry > 0 &&
        item.daysToExpiry <= 3 // Alerte si expire dans moins de 3 jours (0-2 jours)
      );
      
      if (expiringItems.length > 0) {
        const ingredient = this.ingredients().find(i => i.id === recipeIng.ingredientId);
        const minDaysToExpiry = Math.min(...expiringItems.map(i => i.daysToExpiry));
        expiringList.push({
          ingredientId: recipeIng.ingredientId,
          ingredientName: ingredient?.name || 'Unknown',
          daysToExpiry: minDaysToExpiry
        });
      }
    }
    
    return {
      hasExpiring: expiringList.length > 0,
      expiringList
    };
  }

  private enrichMissingIngredients(missing: Array<{ ingredientId: number; quantity: number; unit: string; available: number; missing: number }>) {
    return missing.map(m => {
      const ingredient = this.ingredients().find(i => i.id === m.ingredientId);
      return {
        ...m,
        ingredientName: ingredient?.name || 'Unknown'
      };
    });
  }

  openAddForm(): void {
    this.router.navigate(['/recipes/create']);
  }

  viewRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipes', recipe.id]);
  }

  onSearch(): void {
    // The filtering happens in filteredRecipes getter
    this.updateAllRecipes();
  }

  get filteredRecipes(): RecipeWithStatus[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.recipes();

    return this.recipes().filter(recipe =>
      recipe.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }

  getDifficultyLabel(difficulty: string | number | undefined): string {
    const labels: Record<string | number, string> = {
      1: 'Très facile',
      2: 'Facile',
      3: 'Moyen',
      4: 'Difficile',
      5: 'Très difficile'
    };
    return (difficulty && labels[difficulty]) || 'Moyen';
  }

  openCartModal(recipe: RecipeWithStatus): void {
    const dialogRef = this.dialog.open(CartModalComponent, {
      width: '500px',
      data: {
        recipeName: recipe.name,
        missingIngredients: recipe.missingIngredients || []
      }
    });

    dialogRef.afterClosed().subscribe(portions => {
      if (portions) {
        this.addToShoppingList(recipe, portions);
      }
    });
  }

  private addToShoppingList(recipe: RecipeWithStatus, portions: number): void {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      alert('Aucun ingrédient manquant à ajouter');
      return;
    }

    const itemsToAdd: Array<Omit<ShoppingListItem, 'id' | 'createdAt'>> = [];
    for (const missing of recipe.missingIngredients) {
      const quantityNeeded = missing.missing * portions;
      itemsToAdd.push({
        ingredientId: missing.ingredientId,
        quantityNeeded,
        unit: missing.unit,
        sourceRecipeId: recipe.id,
        sourceRecipeName: recipe.name
      });
    }

    this.shoppingListService.addBulkItems(itemsToAdd);
    alert(`${recipe.missingIngredients.length} ingrédient(s) ajouté(s) à la liste de courses`);
  }
}

