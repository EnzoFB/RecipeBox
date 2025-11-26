import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IngredientStock, StockWithDaysToExpiry, Ingredient } from '../../../core/models';
import { IngredientStockService } from '../../../core/services/ingredient-stock.service';
import { IngredientService } from '../../../core/services/ingredient.service';
import { StockFormDialogComponent } from './stock-form-dialog/stock-form-dialog.component';

@Component({
  selector: 'app-stock',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  stock = signal<StockWithDaysToExpiry[]>([]);
  availableIngredients = signal<Ingredient[]>([]);

  constructor(
    private readonly stockService: IngredientStockService,
    private readonly ingredientService: IngredientService,
    private readonly dialog: MatDialog
  ) {}

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
    this.dialog.open(StockFormDialogComponent, {
      width: '500px',
      data: { item: null, ingredients: this.availableIngredients() }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.stockService.addStock(result);
        this.stock.set(this.stockService.getStockWithExpiry());
      }
    });
  }

  openEditForm(item: IngredientStock): void {
    this.dialog.open(StockFormDialogComponent, {
      width: '500px',
      data: { item, ingredients: this.availableIngredients() }
    }).afterClosed().subscribe((result: any) => {
      if (result) {
        this.stockService.updateStock(item.id!, result);
        this.stock.set(this.stockService.getStockWithExpiry());
      }
    });
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
