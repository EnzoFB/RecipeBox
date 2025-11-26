import { TestBed } from '@angular/core/testing';
import { IngredientService } from './ingredient.service';

describe('IngredientService', () => {
  let service: IngredientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngredientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and load ingredients', () => {
    service.getIngredients().subscribe(ingredients => {
      expect(ingredients).toBeDefined();
      expect(Array.isArray(ingredients)).toBe(true);
    });
  });

  it('should return ingredients with correct properties', () => {
    service.getIngredients().subscribe(ingredients => {
      if (ingredients.length > 0) {
        const ingredient = ingredients[0];
        expect(ingredient.id).toBeDefined();
        expect(ingredient.name).toBeDefined();
        expect(typeof ingredient.name).toBe('string');
      }
    });
  });

  it('should search ingredients by name', () => {
    service.getIngredients().subscribe(ingredients => {
      if (ingredients.length > 0) {
        const searchTerm = ingredients[0].name.substring(0, 2);
        const results = service.searchIngredients(searchTerm);
        expect(Array.isArray(results)).toBe(true);
      }
    });
  });
});
