import { Component, OnInit, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../../core/models';
import { IngredientService, UnitService } from '../../../core/services';

@Component({
  selector: 'app-ingredient-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './ingredient-page.component.html',
  styleUrl: './ingredient-page.component.scss'
})
export class IngredientPageComponent implements OnInit {
  editingId: number | null = null;
  onClose?: () => void;
  
  form!: FormGroup;
  categories = INGREDIENT_CATEGORIES;
  units: Unit[] = [];
  isEditMode = signal(false);
  imagePreview = signal<string | null>(null);
  currentIngredientId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly unitService: UnitService,
    private readonly ingredientService: IngredientService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.unitService.getUnits().subscribe(units => {
      this.units = units;
    });

    // Vérifier si nous sommes en mode édition
    if (this.editingId) {
      this.currentIngredientId = this.editingId;
      this.isEditMode.set(true);
      this.loadIngredient(this.currentIngredientId);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      unitId: [null, Validators.required],
      image: [''],
      calories: [null],
      protein: [null],
      carbs: [null],
      fats: [null]
    });
  }

  private loadIngredient(id: number): void {
    this.ingredientService.getIngredients().subscribe(ingredients => {
      const ingredient = ingredients.find(i => i.id === id);
      if (ingredient) {
        this.form.patchValue({
          name: ingredient.name,
          category: ingredient.category,
          unitId: ingredient.unitId || null,
          image: ingredient.image || '',
          calories: ingredient.calories || null,
          protein: ingredient.protein || null,
          carbs: ingredient.carbs || null,
          fats: ingredient.fats || null
        });
        if (ingredient.image) {
          this.imagePreview.set(ingredient.image);
        }
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64 = e.target?.result as string;
        this.form.patchValue({ image: base64 });
        this.imagePreview.set(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.form.patchValue({ image: '' });
    this.imagePreview.set(null);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      console.error('Form is invalid');
      return;
    }

    const formData: Omit<Ingredient, 'id'> = {
      name: this.form.get('name')?.value?.trim() || '',
      category: this.form.get('category')?.value || '',
      unitId: this.form.get('unitId')?.value || undefined,
      image: this.form.get('image')?.value || undefined,
      calories: this.form.get('calories')?.value || 0,
      protein: this.form.get('protein')?.value || 0,
      carbs: this.form.get('carbs')?.value || 0,
      fats: this.form.get('fats')?.value || 0
    };

    if (this.isEditMode()) {
      this.ingredientService.updateIngredient(this.currentIngredientId!, formData);
    } else {
      this.ingredientService.addIngredient(formData);
    }

    this.onClose?.();
  }

  onCancel(): void {
    this.onClose?.();
  }
}
