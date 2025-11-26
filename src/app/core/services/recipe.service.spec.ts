import { TestBed } from '@angular/core/testing';
import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and load recipes', () => {
    service.getRecipes().subscribe(recipes => {
      expect(recipes).toBeDefined();
      expect(Array.isArray(recipes)).toBe(true);
    });
  });

  it('should search recipes by name', () => {
    const results = service.searchRecipes('Carbonara');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should search recipes by category', () => {
    const results = service.searchRecipes('Plats');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array for non-matching search', () => {
    const results = service.searchRecipes('NonExistent');
    expect(results.length).toBe(0);
  });
});
