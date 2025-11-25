import { Component, Input, OnInit, signal, ChangeDetectionStrategy, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Recipe, Ingredient, RecipeFormData } from '../../../core/models';
import { IngredientService } from '../../../core/services';

@Component({
  selector: 'app-recipe-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeFormComponent implements OnInit, OnChanges {
  @Input() set recipe(value: Recipe | null) {
    this._recipe = value;
    if (value) {
      this.populateForm(value);
    } else {
      this.form.reset();
      this.steps.set([]);
      this.selectedIngredients.set([]);
      this.imagePreview.set(null);
      this.imageBase64.set(null);
    }
  }

  @Output() save = new EventEmitter<RecipeFormData>();
  @Output() formClosed = new EventEmitter<void>();

  form!: FormGroup;
  steps = signal<string[]>([]);
  selectedIngredients = signal<{ ingredientId: number; quantity: number; unit: string }[]>([]);
  availableIngredients = signal<Ingredient[]>([]);
  imagePreview = signal<string | null>(null);
  imageBase64 = signal<string | null>(null);
  newStep = '';

  _recipe: Recipe | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ingredientService: IngredientService
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
    this.ingredientService.getIngredients().subscribe(ingredients => {
      this.availableIngredients.set(ingredients);
    });
  }

  ngOnChanges(): void {
    if (this._recipe) {
      this.populateForm(this._recipe);
    } else {
      this.form.reset();
      this.steps.set([]);
      this.selectedIngredients.set([]);
      this.imagePreview.set(null);
      this.imageBase64.set(null);
    }
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
    } else {
      this.imageBase64.set(null);
      this.imagePreview.set(null);
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

    this.selectedIngredients.update(ingredients => [
      ...ingredients,
      { ingredientId: Number.parseInt(ingredientId), quantity, unit }
    ]);

    this.form.patchValue({ ingredientId: '', quantity: 1, unit: 'g' });
  }

  removeIngredient(index: number): void {
    this.selectedIngredients.update(ingredients =>
      ingredients.filter((_, i) => i !== index)
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

    console.log('Émission save avec:', formData);
    this.save.emit(formData);
  }

  closeForm(): void {
    this.formClosed.emit();
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

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors?.['required'] && !control?.touched) return '';

    if (control?.errors?.['required']) return 'Ce champ est requis';
    if (control?.errors?.['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    if (control?.errors?.['min']) return `Valeur minimale: ${control.errors['min'].min}`;

    return '';
  }
}
