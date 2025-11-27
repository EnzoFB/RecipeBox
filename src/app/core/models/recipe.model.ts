export interface RecipeIngredient {
  ingredientId: number;
  quantity: number;
  unit: string;
}

export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.VERY_EASY]: 'Très facile',
  [DifficultyLevel.EASY]: 'Facile',
  [DifficultyLevel.MEDIUM]: 'Moyen',
  [DifficultyLevel.HARD]: 'Difficile',
  [DifficultyLevel.VERY_HARD]: 'Très difficile'
};

export const DIFFICULTY_LEVELS = Object.values(DifficultyLevel).filter(
  v => typeof v === 'number'
) as DifficultyLevel[];

export interface Recipe {
  id?: number;
  name: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  prepTime: number; // en minutes
  cookTime: number; // en minutes
  image?: string; // base64 ou chemin d'image
  ingredients: RecipeIngredient[];
  steps: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeFormData extends Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> {}
