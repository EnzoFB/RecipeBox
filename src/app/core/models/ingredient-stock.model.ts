export interface IngredientStock {
  id?: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date string (YYYY-MM-DD)
  addedDate?: string;
  // Related fields from join
  name?: string;
  category?: string;
}

export interface StockWithDaysToExpiry extends IngredientStock {
  daysToExpiry: number;
  isExpired: boolean;
}
