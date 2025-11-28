import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { IngredientStock, Ingredient } from '../../../../core/models';
import { UnitService } from '../../../../core/services';

@Component({
  selector: 'app-stock-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './stock-form-dialog.component.html',
  styleUrl: './stock-form-dialog.component.scss'
})
export class StockFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  selectedIngredient: Ingredient | null = null;
  private unitsMap: Map<number, string> = new Map();

  constructor(
    private readonly fb: FormBuilder,
    private readonly unitService: UnitService,
    public dialogRef: MatDialogRef<StockFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: IngredientStock | null; ingredients: Ingredient[] }
  ) {
    this.form = this.fb.group({
      ingredientId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      expiryDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load units map
    this.unitService.getUnits().subscribe(units => {
      this.unitsMap = new Map(units.map(u => [u.id!, u.symbol]));
    });

    if (this.data.item) {
      // Check if the ingredient still exists
      const ingredientExists = this.data.ingredients.find(i => i.id === this.data.item!.ingredientId);
      
      if (!ingredientExists) {
        // Close the dialog since the ingredient was deleted
        this.dialogRef.close();
        return;
      }

      this.isEditMode = true;
      // Convert string date to Date object for datepicker
      const expiryDate = new Date(this.data.item.expiryDate + 'T00:00:00');
      this.form.patchValue({
        ingredientId: this.data.item.ingredientId,
        quantity: this.data.item.quantity,
        expiryDate: expiryDate
      });
      this.onIngredientSelected();
    }

    // Listen for ingredient changes
    this.form.get('ingredientId')?.valueChanges.subscribe(() => {
      this.onIngredientSelected();
    });
  }

  private onIngredientSelected(): void {
    const ingredientId = this.form.get('ingredientId')?.value;
    
    if (ingredientId) {
      this.selectedIngredient = this.data.ingredients.find(i => i.id === ingredientId) || null;
    } else {
      this.selectedIngredient = null;
    }
  }

  onSubmit(): void {    
    if (!this.form.valid || !this.selectedIngredient) {
      return;
    }

    // Get unit symbol, default to empty string if not found
    const unitSymbol = this.selectedIngredient.unitId 
      ? (this.unitsMap.get(this.selectedIngredient.unitId) || '')
      : '';

    // Convert Date to string YYYY-MM-DD format
    const expiryDateValue = this.form.get('expiryDate')?.value;
    let expiryDateString = '';
    
    if (expiryDateValue instanceof Date) {
      const year = expiryDateValue.getFullYear();
      const month = String(expiryDateValue.getMonth() + 1).padStart(2, '0');
      const day = String(expiryDateValue.getDate()).padStart(2, '0');
      expiryDateString = `${year}-${month}-${day}`;
    } else if (typeof expiryDateValue === 'string') {
      expiryDateString = expiryDateValue;
    }

    const formData = {
      ingredientId: this.form.get('ingredientId')?.value,
      quantity: this.form.get('quantity')?.value,
      unit: unitSymbol,
      expiryDate: expiryDateString
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
