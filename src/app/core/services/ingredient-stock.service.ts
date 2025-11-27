import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IngredientStock, StockWithDaysToExpiry } from '../models';

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class IngredientStockService {
  private readonly stock$ = new BehaviorSubject<IngredientStock[]>([]);

  constructor() {
    this.loadStock();
  }

  private loadStock(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.stock.getAll().then((stock: IngredientStock[]) => {
        this.stock$.next(stock);
      }).catch((err: any) => {
        console.error('Error loading stock:', err);
      });
    }
  }

  getStock(): Observable<IngredientStock[]> {
    return this.stock$.asObservable();
  }

  getStockWithExpiry(): StockWithDaysToExpiry[] {
    return this.stock$.value.map(item => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysToExpiry < 0;
      
      return {
        ...item,
        daysToExpiry,
        isExpired
      };
    });
  }

  getExpiringStock(): Observable<IngredientStock[]> {
    return new Observable(observer => {
      if (globalThis.window && (globalThis.window as any).electronAPI) {
        (globalThis.window as any).electronAPI.stock.getExpiring().then((stock: IngredientStock[]) => {
          observer.next(stock);
          observer.complete();
        }).catch((err: any) => {
          console.error('Error fetching expiring stock:', err);
          observer.error(err);
        });
      }
    });
  }

  addStock(stock: IngredientStock): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.stock.add(stock).then(() => {
        this.loadStock();
      }).catch((err: any) => {
        console.error('Error adding stock:', err);
      });
    }
  }

  updateStock(id: number, stock: IngredientStock): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.stock.update(id, stock).then(() => {
        this.loadStock();
      }).catch((err: any) => {
        console.error('Error updating stock:', err);
      });
    }
  }

  deleteStock(id: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.stock.delete(id).then(() => {
        this.loadStock();
      }).catch((err: any) => {
        console.error('Error deleting stock:', err);
      });
    }
  }

  // Helper method to check if a recipe can be made with current stock
  canMakeRecipe(recipeIngredients: Array<{ ingredientId: number; quantity: number; unit: string }>): boolean {
    if (!recipeIngredients || recipeIngredients.length === 0) {
      return false;
    }

    const stock = this.stock$.value;
    
    return recipeIngredients.every(recipeIng => {
      // Agregate stock for this ingredient by unit
      const stockByUnit = this.aggregateStockByUnit(stock, recipeIng.ingredientId);
      
      // Normalize unit for comparison
      const normalizedRecipeUnit = this.normalizeUnit(recipeIng.unit);
      
      // Debug logging
      const allStockForIngredient = stock.filter(s => s.ingredientId === recipeIng.ingredientId);
      console.log(`[DEBUG canMakeRecipe] Ingredient ID ${recipeIng.ingredientId}, Required: ${recipeIng.quantity} "${recipeIng.unit}"`);
      console.log(`[DEBUG canMakeRecipe] Total stock entries for this ingredient:`, allStockForIngredient.length);
      for (const s of allStockForIngredient) {
        console.log(`  Qty: ${s.quantity}, Unit: "${s.unit}", Expiry: ${s.expiryDate}, Expired: ${this.isExpired(s.expiryDate)}`);
      }
      console.log(`[DEBUG canMakeRecipe] Normalized unit: "${normalizedRecipeUnit}"`);
      console.log(`[DEBUG canMakeRecipe] Available stock by unit:`, stockByUnit);
      
      const hasStock = stockByUnit[normalizedRecipeUnit] !== undefined &&
        stockByUnit[normalizedRecipeUnit] >= recipeIng.quantity;
      
      console.log(`[DEBUG canMakeRecipe] Has stock: ${stockByUnit[normalizedRecipeUnit]} >= ${recipeIng.quantity} ? ${hasStock}`);
      
      return hasStock;
    });
  }

  // Aggregate stock quantities by unit for a given ingredient
  private aggregateStockByUnit(stock: IngredientStock[], ingredientId: number): Record<string, number> {
    const aggregated: Record<string, number> = {};
    
    const relevantItems = stock.filter(item => 
      item.ingredientId === ingredientId && 
      !this.isExpired(item.expiryDate)
    );

    for (const item of relevantItems) {
      const normalizedUnit = this.normalizeUnit(item.unit);
      if (!aggregated[normalizedUnit]) {
        aggregated[normalizedUnit] = 0;
      }
      aggregated[normalizedUnit] += item.quantity;
    }
    
    return aggregated;
  }

  // Normalize unit strings for comparison
  private normalizeUnit(unit: string): string {
    return unit.trim().toLowerCase();
  }

  // Helper method to deduct recipe ingredients from stock
  deductRecipeIngredients(recipeIngredients: Array<{ ingredientId: number; quantity: number; unit: string }>): void {
    const stock = this.stock$.value;
    
    for (const recipeIng of recipeIngredients) {
      let remainingQuantity = recipeIng.quantity;
      
      // Find and deduct from stock items (prioritize expiring soon)
      const relevantItems = stock
        .filter(item => 
          item.ingredientId === recipeIng.ingredientId && 
          item.unit === recipeIng.unit &&
          !this.isExpired(item.expiryDate)
        )
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      
      for (const item of relevantItems) {
        if (remainingQuantity <= 0) break;
        
        const deductAmount = Math.min(item.quantity, remainingQuantity);
        const newQuantity = item.quantity - deductAmount;
        
        if (newQuantity <= 0) {
          // Delete the stock item
          this.deleteStock(item.id!);
        } else {
          // Update the stock item
          this.updateStock(item.id!, {
            ...item,
            quantity: newQuantity
          });
        }
        
        remainingQuantity -= deductAmount;
      }
    }
  }

  // Calculate total quantity available for an ingredient
  getTotalQuantityInStock(ingredientId: number, unit: string): number {
    const stock = this.stock$.value;
    const normalizedUnit = this.normalizeUnit(unit);
    return stock
      .filter(item => 
        item.ingredientId === ingredientId && 
        this.normalizeUnit(item.unit) === normalizedUnit &&
        !this.isExpired(item.expiryDate)
      )
      .reduce((total, item) => total + item.quantity, 0);
  }

  // Calculate availability status for recipe ingredients
  // Returns: { status: '✅' | '🟡' | '🔴', missingIngredients: [], hasEnough: boolean }
  calculateRecipeAvailability(recipeIngredients: Array<{ ingredientId: number; quantity: number; unit: string }>): {
    status: '✅' | '🟡' | '🔴';
    missingIngredients: Array<{ ingredientId: number; quantity: number; unit: string; available: number; missing: number }>;
    hasEnough: boolean;
  } {
    const missingIngredients: Array<{ ingredientId: number; quantity: number; unit: string; available: number; missing: number }> = [];

    for (const recipeIng of recipeIngredients) {
      const available = this.getTotalQuantityInStock(recipeIng.ingredientId, recipeIng.unit);
      
      if (available < recipeIng.quantity) {
        missingIngredients.push({
          ingredientId: recipeIng.ingredientId,
          quantity: recipeIng.quantity,
          unit: recipeIng.unit,
          available,
          missing: recipeIng.quantity - available
        });
      }
    }

    if (missingIngredients.length === 0) {
      return {
        status: '✅',
        missingIngredients: [],
        hasEnough: true
      };
    } else if (missingIngredients.length < recipeIngredients.length) {
      return {
        status: '🟡',
        missingIngredients,
        hasEnough: false
      };
    } else {
      return {
        status: '🔴',
        missingIngredients,
        hasEnough: false
      };
    }
  }

  // Get ingredient details for a missing ingredient
  getMissingIngredientDetails(ingredientId: number): Observable<any> {
    return new Observable(observer => {
      if (globalThis.window && (globalThis.window as any).electronAPI) {
        (globalThis.window as any).electronAPI.ingredients.getById(ingredientId).then((ingredient: any) => {
          observer.next(ingredient);
          observer.complete();
        }).catch((err: any) => {
          console.error('Error fetching ingredient details:', err);
          observer.error(err);
        });
      }
    });
  }

  private isExpired(expiryDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    return expiry < today;
  }
}