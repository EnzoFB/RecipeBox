export interface ShoppingListItem {
  id?: number;
  ingredientId: number;
  quantityNeeded: number;
  unit: string;
  sourceRecipeId?: number; // Recette d'où provient l'ingrédient
  sourceRecipeName?: string; // Nom de la recette (pour affichage)
  createdAt?: string;
}

export interface ShoppingListItemWithDetails extends ShoppingListItem {
  ingredientName: string;
  ingredientCategory?: string;
  inStock: number; // Quantité disponible en stock
}
