import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';

interface MissingIngredient {
  ingredientName: string;
  missing: number;
  unit: string;
}

@Component({
  selector: 'app-missing-ingredients-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatListModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="warning-icon">warning</mat-icon>
      Ingrédients manquants
    </h2>

    <mat-dialog-content>
      <p class="info-text">
        Vous n'avez pas assez de tous les ingrédients pour réaliser cette recette.
      </p>

      <div class="missing-list">
        @for (ingredient of missingIngredients; track ingredient.ingredientName) {
          <div class="missing-item">
            <span class="ingredient-name">{{ ingredient.ingredientName }}</span>
            <span class="ingredient-quantity">
              -{{ ingredient.missing | number: '1.2-2' }} {{ ingredient.unit }}
            </span>
          </div>
        }
      </div>

      <div class="total-items">
        <strong>Total: {{ missingIngredients.length }} ingrédient(s) manquant(s)</strong>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onContinueAnyway()">
        <mat-icon>check_circle</mat-icon>
        Continuer malgré tout
      </button>
      <button mat-raised-button color="accent" (click)="onAddToShoppingList()">
        <mat-icon>add_shopping_cart</mat-icon>
        Ajouter à la liste de courses
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-dialog-content {
      min-width: 350px;
      max-width: 500px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #ff6b6b;
    }

    .warning-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .info-text {
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
    }

    .missing-list {
      background: #fafafa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      max-height: 300px;
      overflow-y: auto;
    }

    .missing-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }
    }

    .ingredient-name {
      font-weight: 500;
      flex: 1;
    }

    .ingredient-quantity {
      color: #ff6b6b;
      font-weight: 600;
      margin-left: 12px;
      white-space: nowrap;
    }

    .total-items {
      text-align: center;
      padding: 12px;
      background: #fff3cd;
      border-radius: 4px;
      color: #856404;
      font-size: 13px;
    }

    mat-dialog-actions {
      gap: 12px;
      padding-top: 16px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  `]
})
export class MissingIngredientsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<MissingIngredientsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public missingIngredients: MissingIngredient[]
  ) {}

  onAddToShoppingList(): void {
    this.dialogRef.close('add-to-shopping-list');
  }

  onContinueAnyway(): void {
    this.dialogRef.close('continue-anyway');
  }
}
