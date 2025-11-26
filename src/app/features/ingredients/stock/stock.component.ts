import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IngredientStock, StockWithDaysToExpiry, Ingredient } from '../../../core/models';
import { IngredientStockService } from '../../../core/services/ingredient-stock.service';
import { IngredientService } from '../../../core/services/ingredient.service';

@Component({
  selector: 'app-stock',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  stock = signal<StockWithDaysToExpiry[]>([]);
  availableIngredients = signal<Ingredient[]>([]);
  showForm = signal(false);
  selectedStockItem = signal<IngredientStock | null>(null);
  form!: FormGroup;

  constructor(
    private readonly stockService: IngredientStockService,
    private readonly ingredientService: IngredientService,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({
      ingredientId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      unit: ['g', Validators.required],
      expiryDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load stock
    this.stockService.getStock().subscribe((stockItems: IngredientStock[]) => {
      this.stock.set(this.stockService.getStockWithExpiry());
    });

    // Load available ingredients
    this.ingredientService.getIngredients().subscribe((ingredients: Ingredient[]) => {
      this.availableIngredients.set(ingredients);
    });
  }

  openAddForm(): void {
    this.selectedStockItem.set(null);
    this.form.reset({ unit: 'g' });
    this.showForm.set(true);
  }

  openEditForm(item: IngredientStock): void {
    this.selectedStockItem.set(item);
    this.form.patchValue({
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedStockItem.set(null);
    this.form.reset({ unit: 'g' });
  }

  onSaveStock(): void {
    if (!this.form.valid) return;

    const stockData: IngredientStock = {
      ingredientId: this.form.get('ingredientId')?.value,
      quantity: this.form.get('quantity')?.value,
      unit: this.form.get('unit')?.value,
      expiryDate: this.form.get('expiryDate')?.value
    };

    if (this.selectedStockItem()) {
      this.stockService.updateStock(this.selectedStockItem()!.id!, stockData);
    } else {
      this.stockService.addStock(stockData);
    }

    this.closeForm();
  }

  onDeleteStock(id: number | undefined): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;
    this.stockService.deleteStock(id);
  }

  getIngredientName(ingredientId: number): string {
    return this.availableIngredients().find(i => i.id === ingredientId)?.name || 'Ingrédient supprimé';
  }

  getExpiryStatus(item: StockWithDaysToExpiry): string {
    if (item.isExpired) return 'Expiré';
    if (item.daysToExpiry === 0) return 'Expire aujourd\'hui';
    if (item.daysToExpiry < 3) return `Expire dans ${item.daysToExpiry} jours`;
    return `Expire dans ${item.daysToExpiry} jours`;
  }

  getExpiryStatusClass(item: StockWithDaysToExpiry): string {
    if (item.isExpired) return 'expired';
    if (item.daysToExpiry < 3) return 'expiring-soon';
    return '';
  }
}
