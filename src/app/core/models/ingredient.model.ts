export interface Ingredient {
  id?: number;
  name: string;
  category: string;
  unitId?: number;
  image?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IngredientCategory = 'Fruits' | 'Légumes' | 'Protéines' | 'Produits laitiers' | 'Féculents' | 'Condiments' | 'Autre';

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'Fruits',
  'Légumes',
  'Protéines',
  'Produits laitiers',
  'Féculents',
  'Condiments',
  'Autre'
];
