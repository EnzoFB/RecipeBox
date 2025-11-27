import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../../core/models';
import { IngredientService, UnitService } from '../../../core/services';

@Component({
  selector: 'app-ingredient-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './ingredient-form-page.component.html',
  styleUrl: './ingredient-form-page.component.scss'
})
export class IngredientFormPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  isLoading = false;
  imagePreview: string | null = null;
  categories = INGREDIENT_CATEGORIES;
  units: Unit[] = [];

  private readonly destroy$ = new Subject<void>();
  private ingredientId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ingredientService: IngredientService,
    private readonly unitService: UnitService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load units from service (don't block on units)
    this.unitService.getUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (units) => {
          // Ensure units have IDs (fallback if needed)
          this.units = units.map((u, index) => ({
            ...u,
            id: u.id || index + 1
          }));
        },
        error: (err) => {
          console.error('Error loading units:', err);
        }
      });

    // Check if editing
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.ingredientId = Number.parseInt(params['id'], 10);
          this.isEditMode = true;
          this.loadIngredient();
        } else {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private loadIngredient(): void {
    if (!this.ingredientId) return;
    
    this.isLoading = true;
    this.ingredientService.getIngredients()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ingredients => {
        const ingredient = ingredients.find(i => i.id === this.ingredientId);
        if (ingredient) {
          this.populateForm(ingredient);
        }
        this.isLoading = false;
      });
  }

  private populateForm(ingredient: Ingredient): void {
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
      this.imagePreview = ingredient.image;
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64 = e.target?.result as string;
        this.form.patchValue({ image: base64 });
        this.imagePreview = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.form.patchValue({ image: '' });
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      console.error('Form is invalid:', this.form.errors);
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

    this.isLoading = true;

    if (this.isEditMode && this.ingredientId) {
      this.ingredientService.updateIngredient(this.ingredientId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/ingredients']);
          },
          error: (err: unknown) => {
            console.error('Error updating ingredient:', err);
            this.isLoading = false;
          }
        });
    } else {
      this.ingredientService.addIngredient(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/ingredients']);
          },
          error: (err: unknown) => {
            console.error('Error creating ingredient:', err);
            this.isLoading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/ingredients']);
  }
}
