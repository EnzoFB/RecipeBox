import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recipe, RecipeFormData } from '../models/recipe.model';

declare global {
  interface Window {
    electronAPI: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly recipes$ = new BehaviorSubject<Recipe[]>([]);

  constructor() {
    this.loadRecipes();
  }

  private loadRecipes(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.recipes.getAll().then((recipes: Recipe[]) => {
        this.recipes$.next(recipes);
      }).catch((err: any) => {
        console.error('Error loading recipes:', err);
      });
    }
  }

  getRecipes(): Observable<Recipe[]> {
    return this.recipes$.asObservable();
  }

  getRecipeById(id: number): Recipe | undefined {
    return this.recipes$.value.find(r => r.id === id);
  }

  addRecipe(recipe: RecipeFormData): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.recipes.add(recipe).then(() => {
        this.loadRecipes();
      }).catch((err: any) => {
        console.error('Error adding recipe:', err);
      });
    }
  }

  updateRecipe(id: number, recipe: RecipeFormData): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.recipes.update(id, recipe).then(() => {
        this.loadRecipes();
      }).catch((err: any) => {
        console.error('Error updating recipe:', err);
      });
    }
  }

  deleteRecipe(id: number): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.recipes.delete(id).then(() => {
        this.loadRecipes();
      }).catch((err: any) => {
        console.error('Error deleting recipe:', err);
      });
    }
  }

  searchRecipes(query: string): Recipe[] {
    const lowerQuery = query.toLowerCase();
    return this.recipes$.value.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.category.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery)
    );
  }
}
