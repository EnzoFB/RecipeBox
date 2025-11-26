import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IngredientStock, Ingredient, Unit } from '../../../../core/models';
import { UnitService } from '../../../../core/services';

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
  selectedIngredient: Ingredient | null = null;
  selectedUnit: Unit | null = null;
  private unitsMap: Map<number, Unit> = new Map();

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
    // Build units map
    this.unitService.getUnits().subscribe(units => {
      this.unitsMap = new Map(units.map(u => [u.id!, u]));
      
      if (this.data.item) {
        this.isEditMode = true;
        this.form.patchValue({
          ingredientId: this.data.item.ingredientId,
          quantity: this.data.item.quantity,
          expiryDate: this.data.item.expiryDate
        });
        this.onIngredientSelected();
      }
    });

    // Listen for ingredient changes
    this.form.get('ingredientId')?.valueChanges.subscribe(() => {
      this.onIngredientSelected();
    });
  }

  private onIngredientSelected(): void {
    const ingredientId = this.form.get('ingredientId')?.value;
    if (ingredientId) {
      this.selectedIngredient = this.data.ingredients.find(i => i.id === ingredientId) || null;
      if (this.selectedIngredient?.unitId) {
        this.selectedUnit = this.unitsMap.get(this.selectedIngredient.unitId) || null;
      }
    } else {
      this.selectedIngredient = null;
      this.selectedUnit = null;
    }
  }

  onSubmit(): void {
    if (!this.form.valid || !this.selectedUnit) return;

    const formData: IngredientStock = {
      ingredientId: this.form.get('ingredientId')?.value,
      quantity: this.form.get('quantity')?.value,
      unit: this.selectedUnit.symbol,
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
