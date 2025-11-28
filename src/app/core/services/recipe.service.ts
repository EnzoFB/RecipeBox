import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recipe, RecipeFormData } from '../models/recipe.model';
import { ElectronAPI } from '../models/electron-api.model';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
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
    globalThis.window?.electronAPI?.recipes
      .getAll()
      .then((recipes: unknown[]) => {
        this.recipes$.next(recipes as Recipe[]);
      })
      .catch((err: Error) => {
        console.error('Error loading recipes:', err);
      });
  }

  getRecipes(): Observable<Recipe[]> {
    return this.recipes$.asObservable();
  }

  getRecipeById(id: number): Recipe | undefined {
    return this.recipes$.value.find(r => r.id === id);
  }

  addRecipe(recipe: RecipeFormData): void {
    globalThis.window?.electronAPI?.recipes
      .create(recipe as unknown)
      .then(() => {
        this.loadRecipes();
      })
      .catch((err: Error) => {
        console.error('Error adding recipe:', err);
      });
  }

  updateRecipe(id: number, recipe: RecipeFormData): void {
    globalThis.window?.electronAPI?.recipes
      .update(id, recipe as unknown)
      .then(() => {
        this.loadRecipes();
      })
      .catch((err: Error) => {
        console.error('Error updating recipe:', err);
      });
  }

  deleteRecipe(id: number): void {
    globalThis.window?.electronAPI?.recipes
      .delete(id)
      .then(() => {
        this.loadRecipes();
      })
      .catch((err: Error) => {
        console.error('Error deleting recipe:', err);
      });
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
