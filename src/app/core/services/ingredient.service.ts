import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ingredient, INGREDIENT_CATEGORIES } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private readonly ingredients$ = new BehaviorSubject<Ingredient[]>([]);

  constructor() {
    this.loadIngredients();
  }

  private loadIngredients(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.ingredients.getAll().then((ingredients: Ingredient[]) => {
        this.ingredients$.next(ingredients);
      }).catch((err: any) => {
        console.error('Error loading ingredients:', err);
      });
    }
  }

  getIngredients(): Observable<Ingredient[]> {
    return this.ingredients$.asObservable();
  }

  getIngredientById(id: number): Ingredient | undefined {
    return this.ingredients$.value.find(i => i.id === id);
  }

  getIngredientsByCategory(category: string): Ingredient[] {
    return this.ingredients$.value.filter(i => i.category === category);
  }

  addIngredient(ingredient: Omit<Ingredient, 'id'>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.ingredients.add(ingredient).then(() => {
        setTimeout(() => this.loadIngredients(), 100);
      }).catch((err: any) => {
        console.error('Error adding ingredient:', err);
      });
    }
  }

  updateIngredient(id: number, ingredient: Omit<Ingredient, 'id'>): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.ingredients.update(id, ingredient).then(() => {
        setTimeout(() => this.loadIngredients(), 100);
      }).catch((err: any) => {
        console.error('Error updating ingredient:', err);
      });
    }
  }

  deleteIngredient(id: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.ingredients.delete(id).then(() => {
        setTimeout(() => this.loadIngredients(), 100);
      }).catch((err: any) => {
        console.error('Error deleting ingredient:', err);
      });
    }
  }

  searchIngredients(query: string): Ingredient[] {
    const lowerQuery = query.toLowerCase();
    return this.ingredients$.value.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowerQuery) ||
      ingredient.category.toLowerCase().includes(lowerQuery)
    );
  }

  getCategories(): string[] {
    return INGREDIENT_CATEGORIES;
  }
}
