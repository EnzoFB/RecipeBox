/**
 * Type definitions for Electron API exposed to the renderer process
 * This interface defines all available IPC methods
 */

export interface ElectronAPI {
  recipes: {
    getAll: () => Promise<unknown[]>;
    getById: (id: number) => Promise<unknown>;
    create: (recipe: unknown) => Promise<unknown>;
    update: (id: number, recipe: unknown) => Promise<unknown>;
    delete: (id: number) => Promise<void>;
    search: (query: string) => Promise<unknown[]>;
  };
  ingredients: {
    getAll: () => Promise<unknown[]>;
    getById: (id: number) => Promise<unknown>;
    add: (ingredient: unknown) => Promise<unknown>;
    create: (ingredient: unknown) => Promise<unknown>;
    update: (id: number, ingredient: unknown) => Promise<unknown>;
    delete: (id: number) => Promise<void>;
  };
  stock: {
    getAll: () => Promise<unknown[]>;
    add: (item: unknown) => Promise<unknown>;
    update: (id: number, item: unknown) => Promise<unknown>;
    delete: (id: number) => Promise<void>;
  };
  shoppingList: {
    getAll: () => Promise<unknown[]>;
    getWithDetails: () => Promise<unknown[]>;
    add: (item: unknown) => Promise<unknown>;
    addBulk: (items: unknown[]) => Promise<unknown>;
    update: (id: number, item: unknown) => Promise<unknown>;
    delete: (id: number) => Promise<void>;
    deleteByRecipe: (recipeId: number) => Promise<void>;
    clear: () => Promise<void>;
  };
  units?: {
    getAll?: () => Promise<unknown[]>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
