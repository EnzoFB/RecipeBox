export interface Unit {
  id?: number;
  name: string;
  symbol: string;
  description?: string;
}

export const DEFAULT_UNITS: Unit[] = [
  { name: 'Gramme', symbol: 'g', description: 'Unité de masse' },
  { name: 'Kilogramme', symbol: 'kg', description: 'Kilogramme' },
  { name: 'Millilitre', symbol: 'ml', description: 'Unité de volume' },
  { name: 'Litre', symbol: 'L', description: 'Litre' },
  { name: 'Centilitre', symbol: 'cl', description: 'Centilitre' },
  { name: 'Cuillère à café', symbol: 'cac', description: 'Cuillère à café (~5ml)' },
  { name: 'Cuillère à soupe', symbol: 'cas', description: 'Cuillère à soupe (~15ml)' },
  { name: 'Verre', symbol: 'verre', description: 'Verre (~250ml)' },
  { name: 'Unité', symbol: 'unité', description: 'Nombre d\'éléments' },
  { name: 'Pincée', symbol: 'pincée', description: 'Pincée' }
];
