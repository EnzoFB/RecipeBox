import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Ingredient, INGREDIENT_CATEGORIES, Unit } from '../../../core/models';
import { UnitService } from '../../../core/services';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './ingredient-form.component.html',
  styleUrl: './ingredient-form.component.scss'
})
export class IngredientFormComponent implements OnInit {
  form!: FormGroup;
  categories = INGREDIENT_CATEGORIES;
  units: Unit[] = [];
  isEditMode = false;
  imagePreview: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly unitService: UnitService,
    public dialogRef: MatDialogRef<IngredientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ingredient: Ingredient | null }
  ) {
    this.units = this.unitService.getUnitsSync();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      unitId: ['', Validators.required],
      image: [''],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fats: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (!this.units.length) {
      this.units = this.unitService.getUnitsSync();
    }
    if (this.data.ingredient) {
      this.isEditMode = true;
      this.populateForm(this.data.ingredient);
    }
  }

  private populateForm(ingredient: Ingredient): void {
    this.form.patchValue({
      name: ingredient.name,
      category: ingredient.category,
      unitId: ingredient.unitId,
      image: ingredient.image || '',
      calories: ingredient.calories || 0,
      protein: ingredient.protein || 0,
      carbs: ingredient.carbs || 0,
      fats: ingredient.fats || 0
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
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const formData: Omit<Ingredient, 'id'> = {
      name: this.form.get('name')?.value,
      category: this.form.get('category')?.value,
      unitId: this.form.get('unitId')?.value,
      image: this.form.get('image')?.value || undefined,
      calories: this.form.get('calories')?.value,
      protein: this.form.get('protein')?.value,
      carbs: this.form.get('carbs')?.value,
      fats: this.form.get('fats')?.value
    };

    this.dialogRef.close(formData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
