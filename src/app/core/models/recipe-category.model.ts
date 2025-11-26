/**
 * Recipe Categories
 * Liste centralisée des catégories de recettes utilisée dans toute l'application
 */

export const RECIPE_CATEGORIES = [
  'Entrée',
  'Plat principal',
  'Plats',
  'Salades',
  'Dessert',
  'Boisson',
  'Sauce'
] as const;

export type RecipeCategory = typeof RECIPE_CATEGORIES[number];
