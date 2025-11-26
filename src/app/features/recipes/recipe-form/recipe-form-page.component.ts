import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Recipe, Ingredient, RecipeFormData } from '../../../core/models';
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
    MatCardModule,
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
      prepTime: [15, [Validators.required, Validators.min(0)]],
      cookTime: [30, [Validators.required, Validators.min(0)]],
      servings: [4, [Validators.required, Validators.min(1)]],
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
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings
    });
    this.steps.set(recipe.steps ? [...recipe.steps] : []);
    this.selectedIngredients.set(recipe.ingredients ? [...recipe.ingredients] : []);
    if (recipe.image) {
      this.imageBase64.set(recipe.image);
      this.imagePreview.set(recipe.image);
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageBase64.set(e.target.result);
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageBase64.set(null);
    this.imagePreview.set(null);
  }

  addIngredient(): void {
    const ingredientId = this.form.get('ingredientId')?.value;
    const quantity = this.form.get('quantity')?.value;
    const unit = this.form.get('unit')?.value;

    if (!ingredientId || !quantity || !unit) {
      alert('Veuillez remplir tous les champs d\'ingrédient');
      return;
    }

    const exists = this.selectedIngredients().some(ing => ing.ingredientId === Number.parseInt(ingredientId));
    if (exists) {
      alert('Cet ingrédient est déjà ajouté');
      return;
    }

    this.selectedIngredients.update(ingredients => [
      ...ingredients,
      { ingredientId: Number.parseInt(ingredientId), quantity, unit }
    ]);

    this.form.patchValue({ ingredientId: '', quantity: 1, unit: 'g' });
  }

  removeIngredient(ingredientId: number): void {
    this.selectedIngredients.update(ingredients =>
      ingredients.filter(ing => ing.ingredientId !== ingredientId)
    );
  }

  addStep(): void {
    if (this.newStep.trim()) {
      this.steps.update(steps => [...steps, this.newStep]);
      this.newStep = '';
    }
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
    if (!this.form.valid || this.steps().length === 0 || this.selectedIngredients().length === 0) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const formData: RecipeFormData = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      category: this.form.get('category')?.value,
      prepTime: this.form.get('prepTime')?.value,
      cookTime: this.form.get('cookTime')?.value,
      servings: this.form.get('servings')?.value,
      image: this.imageBase64() || undefined,
      ingredients: this.selectedIngredients(),
      steps: this.steps()
    };

    if (this.isEditMode() && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, formData);
    } else {
      this.recipeService.addRecipe(formData);
    }

    this.router.navigate(['/recipes']);
  }

  onCancel(): void {
    this.router.navigate(['/recipes']);
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
}
