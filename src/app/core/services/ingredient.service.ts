import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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
    globalThis.window?.electronAPI?.ingredients
      .getAll()
      .then((ingredients: unknown[]) => {
        this.ingredients$.next(ingredients as Ingredient[]);
      })
      .catch((err: Error) => {
        console.error('Error loading ingredients:', err);
      });
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

  addIngredient(ingredient: Omit<Ingredient, 'id'>): Observable<void> {
    return from(
      globalThis.window?.electronAPI?.ingredients.add(ingredient as unknown) || Promise.resolve()
    ).pipe(
      map(() => undefined),
      tap(() => {
        setTimeout(() => this.loadIngredients(), 100);
      })
    );
  }

  updateIngredient(id: number, ingredient: Omit<Ingredient, 'id'>): Observable<void> {
    return from(
      globalThis.window?.electronAPI?.ingredients.update(id, ingredient as unknown) || Promise.resolve()
    ).pipe(
      map(() => undefined),
      tap(() => {
        setTimeout(() => this.loadIngredients(), 100);
      })
    );
  }

  deleteIngredient(id: number): void {
    globalThis.window?.electronAPI?.ingredients
      .delete(id)
      .then(() => {
        setTimeout(() => this.loadIngredients(), 100);
      })
      .catch((err: Error) => {
        console.error('Error deleting ingredient:', err);
      });
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
