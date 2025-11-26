import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IngredientStock, Ingredient } from '../../../../core/models';

@Component({
  selector: 'app-stock-form-dialog',
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
  templateUrl: './stock-form-dialog.component.html',
  styleUrl: './stock-form-dialog.component.scss'
})
export class StockFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  units = ['g', 'kg', 'ml', 'l', 'c. à soupe', 'c. à café', 'unité'];

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<StockFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: IngredientStock | null; ingredients: Ingredient[] }
  ) {
    this.form = this.fb.group({
      ingredientId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      unit: ['g', Validators.required],
      expiryDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data.item) {
      this.isEditMode = true;
      this.form.patchValue({
        ingredientId: this.data.item.ingredientId,
        quantity: this.data.item.quantity,
        unit: this.data.item.unit,
        expiryDate: this.data.item.expiryDate
      });
    }
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const formData: IngredientStock = {
      ingredientId: this.form.get('ingredientId')?.value,
      quantity: this.form.get('quantity')?.value,
      unit: this.form.get('unit')?.value,
      expiryDate: this.form.get('expiryDate')?.value
    };

    this.dialogRef.close(formData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getIngredientName(id: number): string {
    return this.data.ingredients.find(i => i.id === id)?.name || '';
  }
}
