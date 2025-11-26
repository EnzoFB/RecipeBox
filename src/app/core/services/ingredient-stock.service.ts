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
    const stock = this.stock$.value;
    
    return recipeIngredients.every(recipeIng => {
      const hasStock = stock.some(stockItem => 
        stockItem.ingredientId === recipeIng.ingredientId && 
        stockItem.quantity >= recipeIng.quantity &&
        stockItem.unit === recipeIng.unit &&
        !this.isExpired(stockItem.expiryDate)
      );
      return hasStock;
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
