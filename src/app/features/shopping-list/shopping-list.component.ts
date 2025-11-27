import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ShoppingListItemWithDetails } from '../../core/models';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { IngredientStockService } from '../../core/services/ingredient-stock.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ShoppingListRow extends ShoppingListItemWithDetails {
  boughtQuantity?: number;
  expiryDateForBought?: string;
  mode?: 'edit' | 'buy';
}

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss'
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  shoppingList: ShoppingListRow[] = [];
  dataSource = new MatTableDataSource<ShoppingListRow>();
  displayedColumns: string[] = ['ingredientName', 'quantity', 'unit', 'sourceRecipe', 'actions'];
  buyingColumns: string[] = ['ingredientName', 'quantityNeeded', 'boughtQuantity', 'expiryDate', 'actions'];
  
  isBuyMode = false;
  totalItems = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly shoppingListService: ShoppingListService,
    private readonly stockService: IngredientStockService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadShoppingList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadShoppingList(): void {
    this.shoppingListService.getShoppingListWithDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          console.log('Shopping list loaded:', items);
          this.totalItems = items.length;
          this.shoppingList = items.map(item => ({
            ...item,
            mode: 'edit',
            boughtQuantity: item.quantityNeeded,
            expiryDateForBought: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }));
          this.dataSource.data = this.shoppingList;
          console.log('Data source updated:', this.dataSource.data);
        },
        error: (err) => {
          console.error('Error loading shopping list:', err);
          this.totalItems = 0;
          this.shoppingList = [];
          this.dataSource.data = [];
        }
      });
  }

  deleteItem(id: number): void {
    if (confirm('Supprimer cet ingrédient de la liste ?')) {
      this.shoppingListService.deleteItem(id);
    }
  }

  updateQuantity(item: ShoppingListRow, newQuantity: string): void {
    const quantity = Number.parseFloat(newQuantity);
    if (quantity > 0 && item.id) {
      this.shoppingListService.updateItem(item.id, { quantityNeeded: quantity });
    }
  }

  addItemToStock(item: ShoppingListRow): void {
    if (!item.boughtQuantity || !item.expiryDateForBought) {
      alert('Veuillez entrer la quantité achetée et la date de péremption');
      return;
    }

    // Add to stock
    const stockItem = {
      ingredientId: item.ingredientId,
      quantity: item.boughtQuantity,
      unit: item.unit,
      expiryDate: item.expiryDateForBought
    };

    this.stockService.addStock(stockItem);

    // Remove from shopping list
    this.shoppingListService.deleteItem(item.id!);
    
    alert(`✅ ${item.ingredientName} ajouté au stock!`);
  }

  addAllToStock(): void {
    let addedCount = 0;
    const itemsToAdd = [...this.shoppingList]; // Create a copy to avoid issues during iteration

    for (const item of itemsToAdd) {
      if (item.boughtQuantity && item.expiryDateForBought) {
        // Add to stock
        const stockItem = {
          ingredientId: item.ingredientId,
          quantity: item.boughtQuantity,
          unit: item.unit,
          expiryDate: item.expiryDateForBought
        };

        this.stockService.addStock(stockItem);

        // Remove from shopping list
        if (item.id) {
          this.shoppingListService.deleteItem(item.id);
        }
        
        addedCount++;
      }
    }

    if (addedCount > 0) {
      alert(`✅ ${addedCount} article(s) ajouté(s) au stock!`);
      this.router.navigate(['/ingredients/stock']);
    } else {
      alert('⚠️ Veuillez remplir les quantités et dates de péremption pour tous les articles');
    }
  }

  clearShoppingList(): void {
    if (confirm('Vider complètement la liste de courses ?')) {
      this.shoppingListService.clearShoppingList();
    }
  }

  goBack(): void {
    this.router.navigate(['/recipes']);
  }
}
