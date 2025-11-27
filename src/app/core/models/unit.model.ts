export interface Unit {
  id?: number;
  name: string;
  symbol: string;
  description?: string;
}

export const DEFAULT_UNITS: Unit[] = [
  { id: 1, name: 'Gramme', symbol: 'g', description: 'Unité de masse' },
  { id: 2, name: 'Kilogramme', symbol: 'kg', description: 'Kilogramme' },
  { id: 3, name: 'Millilitre', symbol: 'ml', description: 'Unité de volume' },
  { id: 4, name: 'Litre', symbol: 'L', description: 'Litre' },
  { id: 5, name: 'Centilitre', symbol: 'cl', description: 'Centilitre' },
  { id: 6, name: 'Cuillère à café', symbol: 'cac', description: 'Cuillère à café (~5ml)' },
  { id: 7, name: 'Cuillère à soupe', symbol: 'cas', description: 'Cuillère à soupe (~15ml)' },
  { id: 8, name: 'Verre', symbol: 'verre', description: 'Verre (~250ml)' },
  { id: 9, name: 'Unité', symbol: 'unité', description: 'Nombre d\'éléments' },
  { id: 10, name: 'Pincée', symbol: 'pincée', description: 'Pincée' }
];
