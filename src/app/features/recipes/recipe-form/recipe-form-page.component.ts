import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Recipe, Ingredient, RecipeFormData, RECIPE_CATEGORIES, DEFAULT_UNITS, DIFFICULTY_LABELS, DIFFICULTY_LEVELS } from '../../../core/models';
import { IngredientService, RecipeService } from '../../../core/services';

@Component({
  selector: 'app-recipe-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  templateUrl: './recipe-form-page.component.html',
  styleUrl: './recipe-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeFormPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  steps = signal<string[]>([]);
  selectedIngredients = signal<{ ingredientId: number; quantity: number; unit: string }[]>([]);
  availableIngredients = signal<Ingredient[]>([]);
  imagePreview = signal<string | null>(null);
  imageBase64 = signal<string | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);
  newStep = '';
  
  // Constants pour les options du formulaire
  readonly recipeCategories = RECIPE_CATEGORIES;
  readonly availableUnits = DEFAULT_UNITS.map(u => u.symbol);
  readonly difficultyLevels = DIFFICULTY_LEVELS;
  readonly difficultyLabels = DIFFICULTY_LABELS;

  private readonly destroy$ = new Subject<void>();
  private recipeId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ingredientService: IngredientService,
    private readonly recipeService: RecipeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      difficulty: [2, Validators.required],
      prepTime: [15, [Validators.required, Validators.min(0)]],
      cookTime: [30, [Validators.required, Validators.min(0)]],
      ingredientId: [''],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      unit: ['g']
    });
  }

  ngOnInit(): void {
    this.isLoading.set(true);

    // Load available ingredients
    this.ingredientService.getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ingredients => {
        this.availableIngredients.set(ingredients);
      });

    // Check if editing
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.recipeId = Number(params['id']);
          this.isEditMode.set(true);
          this.loadRecipe(this.recipeId);
        } else {
          this.isLoading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecipe(id: number): void {
    // Subscribe to recipes to ensure data is loaded
    this.recipeService.getRecipes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(recipes => {
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
          this.populateForm(recipe);
        }
        this.isLoading.set(false);
      });
  }

  private populateForm(recipe: Recipe): void {
    this.form.patchValue({
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime
    });
    this.steps.set(recipe.steps ? [...recipe.steps] : []);
    this.selectedIngredients.set(recipe.ingredients ? [...recipe.ingredients] : []);
    if (recipe.image) {
      this.imageBase64.set(recipe.image);
      this.imagePreview.set(recipe.image);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
        const result = loadEvent.target?.result as string | null;
        if (result) {
          this.imageBase64.set(result);
          this.imagePreview.set(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageBase64.set(null);
    this.imagePreview.set(null);
  }

  addIngredient(): void {
    if (!this.isIngredientFieldsValid()) {
      return;
    }

    const ingredientId = Number.parseInt(this.form.get('ingredientId')?.value);
    const quantity = this.form.get('quantity')?.value;
    const unit = this.form.get('unit')?.value;

    const exists = this.selectedIngredients().some(ing => ing.ingredientId === ingredientId);
    if (exists) {
      return;
    }

    this.selectedIngredients.update(ingredients => [
      ...ingredients,
      { ingredientId, quantity, unit }
    ]);

    // Reset ingredient fields
    this.form.patchValue({ 
      ingredientId: '', 
      quantity: 1, 
      unit: 'g' 
    });
  }

  removeIngredient(ingredientId: number): void {
    this.selectedIngredients.update(ingredients =>
      ingredients.filter(ing => ing.ingredientId !== ingredientId)
    );
  }

  addStep(): void {
    const trimmedStep = this.newStep.trim();
    if (!trimmedStep) {
      return;
    }

    this.steps.update(steps => [...steps, trimmedStep]);
    this.newStep = '';
  }

  removeStep(index: number): void {
    this.steps.update(steps => steps.filter((_, i) => i !== index));
  }

  dropStep(event: CdkDragDrop<string[]>): void {
    const stepsArray = [...this.steps()];
    moveItemInArray(stepsArray, event.previousIndex, event.currentIndex);
    this.steps.set(stepsArray);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationErrors();
      return;
    }

    const formData: RecipeFormData = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      category: this.form.get('category')?.value,
      difficulty: this.form.get('difficulty')?.value,
      prepTime: this.form.get('prepTime')?.value,
      cookTime: this.form.get('cookTime')?.value,
      image: this.imageBase64() || undefined,
      ingredients: this.selectedIngredients(),
      steps: this.steps()
    };

    if (this.isEditMode() && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, formData);
    } else {
      this.recipeService.addRecipe(formData);
    }

    this.router.navigate(['/recipes/manage']);
  }

  onCancel(): void {
    this.router.navigate(['/recipes/manage']);
  }

  getIngredientName(ingredientId: number): string {
    const ingredient = this.availableIngredients().find(i => i.id === ingredientId);
    return ingredient?.name || 'Ingrédient supprimé';
  }

  isFormValid(): boolean {
    return this.form.valid && this.steps().length > 0 && this.selectedIngredients().length > 0;
  }

  isIngredientFieldsValid(): boolean {
    const ingredientId = this.form.get('ingredientId')?.value;
    const quantity = this.form.get('quantity')?.value;
    const unit = this.form.get('unit')?.value;
    return !!ingredientId && !!quantity && !!unit;
  }

  canAddStep(): boolean {
    return this.newStep.trim().length > 0;
  }

  private showValidationErrors(): void {
    if (!this.form.valid) {
      for (const key of Object.keys(this.form.controls)) {
        this.form.get(key)?.markAsTouched();
      }
    }
    
    if (this.selectedIngredients().length === 0) {
      console.warn('Aucun ingrédient ajouté');
    }
    
    if (this.steps().length === 0) {
      console.warn('Aucune étape ajoutée');
    }
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }
}
