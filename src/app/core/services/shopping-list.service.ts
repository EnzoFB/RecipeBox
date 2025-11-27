import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ShoppingListItem, ShoppingListItemWithDetails } from '../models';

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private readonly shoppingList$ = new BehaviorSubject<ShoppingListItem[]>([]);
  private readonly shoppingListWithDetails$ = new BehaviorSubject<ShoppingListItemWithDetails[]>([]);

  constructor() {
    this.loadShoppingList();
  }

  private loadShoppingList(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.getAll().then((items: ShoppingListItem[]) => {
        console.log('Loaded shopping list items:', items);
        this.shoppingList$.next(items);
        // Load detailed version after loading basic list
        this.loadWithDetails();
      }).catch((err: any) => {
        console.error('Error loading shopping list:', err);
        this.shoppingList$.next([]);
      });
    } else {
      console.warn('Electron API not available');
    }
  }

  private loadWithDetails(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.getWithDetails().then((items: ShoppingListItemWithDetails[]) => {
        console.log('Loaded shopping list with details:', items);
        this.shoppingListWithDetails$.next(items);
      }).catch((err: any) => {
        console.error('Error fetching shopping list with details:', err);
        this.shoppingListWithDetails$.next([]);
      });
    } else {
      console.warn('Electron API not available');
    }
  }

  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.shoppingList$.asObservable();
  }

  getShoppingListValue(): ShoppingListItem[] {
    return this.shoppingList$.value;
  }

  getShoppingListWithDetails(): Observable<ShoppingListItemWithDetails[]> {
    return this.shoppingListWithDetails$.asObservable();
  }

  addItem(item: Omit<ShoppingListItem, 'id' | 'createdAt'>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.add(item).then(() => {
        console.log('Item added to shopping list');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error adding item to shopping list:', err);
      });
    }
  }

  addBulkItems(items: Array<Omit<ShoppingListItem, 'id' | 'createdAt'>>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      console.log('Adding bulk items:', items);
      (globalThis.window as any).electronAPI.shoppingList.addBulk(items).then(() => {
        console.log('Bulk items added to shopping list');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error adding bulk items to shopping list:', err);
      });
    }
  }

  updateItem(id: number, item: Partial<ShoppingListItem>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.update(id, item).then(() => {
        console.log('Item updated in shopping list');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error updating shopping list item:', err);
      });
    }
  }

  deleteItem(id: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.delete(id).then(() => {
        console.log('Item deleted from shopping list');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error deleting shopping list item:', err);
      });
    }
  }

  deleteByRecipe(recipeId: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.deleteByRecipe(recipeId).then(() => {
        console.log('Items deleted by recipe from shopping list');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error deleting shopping list items by recipe:', err);
      });
    }
  }

  clearShoppingList(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.clear().then(() => {
        console.log('Shopping list cleared');
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error clearing shopping list:', err);
      });
    }
  }
}
