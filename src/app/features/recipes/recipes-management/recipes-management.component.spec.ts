import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipesManagementComponent } from './recipes-management.component';
import { RecipeService } from '../../../core/services';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('RecipesManagementComponent', () => {
  let component: RecipesManagementComponent;
  let fixture: ComponentFixture<RecipesManagementComponent>;
  let mockRecipeService: jasmine.SpyObj<RecipeService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockRecipeService = jasmine.createSpyObj('RecipeService', [
      'getRecipes',
      'addRecipe',
      'updateRecipe',
      'deleteRecipe',
      'searchRecipes'
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockRecipeService.getRecipes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RecipesManagementComponent],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecipesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipes on init', () => {
    expect(mockRecipeService.getRecipes).toHaveBeenCalled();
  });
});
