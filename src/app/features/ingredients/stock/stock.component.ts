import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
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
    MatDialogModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss'
})
export class StockComponent implements OnInit {
  stock = signal<StockWithDaysToExpiry[]>([]);
  availableIngredients = signal<Ingredient[]>([]);
  viewMode = signal<'cards' | 'table'>('cards');
  displayedColumns = ['image', 'name', 'category', 'quantity', 'expiry', 'status', 'actions'];
  private currentDialog: any = null;

  constructor(
    private readonly stockService: IngredientStockService,
    private readonly ingredientService: IngredientService,
    private readonly dialog: MatDialog
  ) { }

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
    this.currentDialog = this.dialog.open(StockFormDialogComponent, {
      width: '500px',
      data: { item, ingredients: this.availableIngredients() }
    });

    this.currentDialog.afterClosed().subscribe((result: any) => {
      this.currentDialog = null;
      if (result) {
        this.stockService.updateStock(item.id!, result);
        this.stock.set(this.stockService.getStockWithExpiry());
      }
    });
  }

  onDeleteStock(id: number | undefined): void {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) return;

    // Close the edit dialog if it's open
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
    }

    this.stockService.deleteStock(id);
  }

  onDuplicateStock(item: IngredientStock): void {
    const duplicatedItem = {
      ingredientId: item.ingredientId,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate
    };

    this.stockService.addStock(duplicatedItem);
    this.stock.set(this.stockService.getStockWithExpiry());
  }

  getIngredientName(ingredientId: number): string {
    return this.availableIngredients().find(i => i.id === ingredientId)?.name || 'Ingrédient supprimé';
  }

  getIngredientImage(ingredientId: number): string | undefined {
    return this.availableIngredients().find(i => i.id === ingredientId)?.image;
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

  onViewModeChange(event: any): void {
    this.viewMode.set(event.value);
  }

  getCategoriesFromStock(): string[] {
    const categories = new Set(this.stock().map(item => item.category).filter((cat): cat is string => !!cat));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }

  getItemsByCategory(category: string): StockWithDaysToExpiry[] {
    return this.stock().filter(item => item.category === category);
  }
}
