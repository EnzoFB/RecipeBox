import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ShoppingListItem, ShoppingListItemWithDetails } from '../models';
import { ElectronAPI } from '../models/electron-api.model';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
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
    globalThis.window?.electronAPI?.shoppingList
      .getAll()
      .then((items: unknown) => {
        console.log('Loaded shopping list items:', items);
        this.shoppingList$.next(items as ShoppingListItem[]);
        // Load detailed version after loading basic list
        this.loadWithDetails();
      })
      .catch((err: Error) => {
        console.error('Error loading shopping list:', err);
        this.shoppingList$.next([]);
      });
  }

  private loadWithDetails(): void {
    globalThis.window?.electronAPI?.shoppingList
      .getWithDetails()
      .then((items: unknown) => {
        console.log('Loaded shopping list with details:', items);
        this.shoppingListWithDetails$.next(items as ShoppingListItemWithDetails[]);
      })
      .catch((err: Error) => {
        console.error('Error fetching shopping list with details:', err);
        this.shoppingListWithDetails$.next([]);
      });
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
    globalThis.window?.electronAPI?.shoppingList
      .add(item)
      .then(() => {
        console.log('Item added to shopping list');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error adding item to shopping list:', err);
      });
  }

  addBulkItems(items: Array<Omit<ShoppingListItem, 'id' | 'createdAt'>>): void {
    console.log('Adding bulk items:', items);
    globalThis.window?.electronAPI?.shoppingList
      .addBulk(items)
      .then(() => {
        console.log('Bulk items added to shopping list');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error adding bulk items to shopping list:', err);
      });
  }

  updateItem(id: number, item: Partial<ShoppingListItem>): void {
    globalThis.window?.electronAPI?.shoppingList
      .update(id, item)
      .then(() => {
        console.log('Item updated in shopping list');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error updating shopping list item:', err);
      });
  }

  deleteItem(id: number): void {
    globalThis.window?.electronAPI?.shoppingList
      .delete(id)
      .then(() => {
        console.log('Item deleted from shopping list');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error deleting shopping list item:', err);
      });
  }

  deleteByRecipe(recipeId: number): void {
    globalThis.window?.electronAPI?.shoppingList
      .deleteByRecipe(recipeId)
      .then(() => {
        console.log('Items deleted by recipe from shopping list');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error deleting shopping list items by recipe:', err);
      });
  }

  clearShoppingList(): void {
    globalThis.window?.electronAPI?.shoppingList
      .clear()
      .then(() => {
        console.log('Shopping list cleared');
        this.loadShoppingList();
      })
      .catch((err: Error) => {
        console.error('Error clearing shopping list:', err);
      });
  }
}
