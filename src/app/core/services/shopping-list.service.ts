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

  constructor() {
    this.loadShoppingList();
  }

  private loadShoppingList(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.getAll().then((items: ShoppingListItem[]) => {
        this.shoppingList$.next(items);
      }).catch((err: any) => {
        console.error('Error loading shopping list:', err);
      });
    }
  }

  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.shoppingList$.asObservable();
  }

  getShoppingListValue(): ShoppingListItem[] {
    return this.shoppingList$.value;
  }

  getShoppingListWithDetails(): Observable<ShoppingListItemWithDetails[]> {
    return new Observable(observer => {
      if (globalThis.window && (globalThis.window as any).electronAPI) {
        (globalThis.window as any).electronAPI.shoppingList.getWithDetails().then((items: ShoppingListItemWithDetails[]) => {
          observer.next(items);
          observer.complete();
        }).catch((err: any) => {
          console.error('Error fetching shopping list with details:', err);
          observer.error(err);
        });
      }
    });
  }

  addItem(item: Omit<ShoppingListItem, 'id' | 'createdAt'>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.add(item).then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error adding item to shopping list:', err);
      });
    }
  }

  addBulkItems(items: Array<Omit<ShoppingListItem, 'id' | 'createdAt'>>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.addBulk(items).then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error adding bulk items to shopping list:', err);
      });
    }
  }

  updateItem(id: number, item: Partial<ShoppingListItem>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.update(id, item).then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error updating shopping list item:', err);
      });
    }
  }

  deleteItem(id: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.delete(id).then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error deleting shopping list item:', err);
      });
    }
  }

  deleteByRecipe(recipeId: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.deleteByRecipe(recipeId).then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error deleting shopping list items by recipe:', err);
      });
    }
  }

  clearShoppingList(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.shoppingList.clear().then(() => {
        this.loadShoppingList();
      }).catch((err: any) => {
        console.error('Error clearing shopping list:', err);
      });
    }
  }
}
