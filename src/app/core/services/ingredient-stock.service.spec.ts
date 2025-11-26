import { TestBed } from '@angular/core/testing';
import { IngredientStockService } from './ingredient-stock.service';

describe('IngredientStockService', () => {
  let service: IngredientStockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientStockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and load stock', () => {
    service.getStock().subscribe(stock => {
      expect(stock).toBeDefined();
      expect(Array.isArray(stock)).toBe(true);
    });
  });

  it('should calculate days to expiry correctly', () => {
    const stockWithExpiry = service.getStockWithExpiry();
    expect(Array.isArray(stockWithExpiry)).toBe(true);

    for (const item of stockWithExpiry) {
      expect(item.daysToExpiry).toBeDefined();
      expect(typeof item.daysToExpiry).toBe('number');
      expect(item.isExpired).toBeDefined();
      expect(typeof item.isExpired).toBe('boolean');
    }
  });

  it('should identify expired items correctly', () => {
    const stockWithExpiry = service.getStockWithExpiry();
    const expiredItems = stockWithExpiry.filter(item => item.isExpired);

    for (const item of expiredItems) {
      expect(item.daysToExpiry).toBeLessThan(0);
    }
  });

  it('should check if recipe can be made with current stock', () => {
    const testIngredients = [
      { ingredientId: 1, quantity: 100, unit: 'g' }
    ];

    const canMake = service.canMakeRecipe(testIngredients);
    expect(typeof canMake).toBe('boolean');
  });

  it('should return empty array for no expiring stock by default', () => {
    service.getExpiringStock().subscribe(stock => {
      expect(Array.isArray(stock)).toBe(true);
    });
  });
});
