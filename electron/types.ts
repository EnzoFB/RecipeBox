/**
 * Type definitions for Recipe Box application
 */

// ============================================================================
// Core Models
// ============================================================================

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category: string;
  unitId?: number;
  image?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  ingredientId: number;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  category?: string;
  difficulty?: number;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientStock {
  id: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  addedDate?: string;
  // Enriched fields from JOIN
  name?: string;
  category?: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface IPCHandlers {
  // Recipe handlers
  'recipes:getAll': () => Promise<Recipe[]>;
  'recipes:getById': (id: number) => Promise<Recipe | null>;
  'recipes:add': (recipe: Omit<Recipe, 'id'>) => Promise<number>;
  'recipes:update': (id: number, recipe: Partial<Recipe>) => Promise<void>;
  'recipes:delete': (id: number) => Promise<void>;

  // Ingredient handlers
  'ingredients:getAll': () => Promise<Ingredient[]>;
  'ingredients:add': (ingredient: Omit<Ingredient, 'id'>) => Promise<number>;
  'ingredients:update': (id: number, ingredient: Partial<Ingredient>) => Promise<void>;
  'ingredients:delete': (id: number) => Promise<void>;

  // Stock handlers
  'stock:getAll': () => Promise<IngredientStock[]>;
  'stock:add': (stock: Omit<IngredientStock, 'id'>) => Promise<number>;
  'stock:update': (id: number, stock: Partial<IngredientStock>) => Promise<void>;
  'stock:delete': (id: number) => Promise<void>;
  'stock:getExpiring': () => Promise<IngredientStock[]>;
}

// ============================================================================
// Database Options
// ============================================================================

export interface RunAsyncOptions {
  sql: string;
  params?: any[];
}

export interface TableSchema {
  name: string;
  sql: string;
}

export interface Migration {
  table: string;
  column: string;
  type: string;
}
