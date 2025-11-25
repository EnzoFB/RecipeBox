export interface RecipeIngredient {
  ingredientId: number;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id?: number;
  name: string;
  description: string;
  category: string;
  prepTime: number; // en minutes
  cookTime: number; // en minutes
  servings: number;
  image?: string; // base64 ou chemin d'image
  ingredients: RecipeIngredient[];
  steps: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeFormData extends Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> {}
