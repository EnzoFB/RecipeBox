import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface MissingIngredient {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  available: number;
  missing: number;
}

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="cart-modal">
      <h2>{{ data.recipeName }}</h2>
      
      <div class="portions-section">
        <label for="portions">Nombre de portions :</label>
        <div class="portions-input-group">
          <button mat-icon-button (click)="decreasePortions()" [disabled]="portions() <= 1">
            <mat-icon>remove</mat-icon>
          </button>
          <input 
            id="portions"
            type="number" 
            class="portions-input" 
            [(ngModel)]="portionValue" 
            (change)="updatePortions()"
            min="1"
            max="20"
          />
          <button mat-icon-button (click)="increasePortions()" [disabled]="portions() >= 20">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </div>

      <div class="preview-section">
        <h3>Aperçu des ingrédients à ajouter</h3>
        <div class="ingredients-list">
          @for (ingredient of displayedIngredients(); track ingredient.ingredientId) {
            <div class="ingredient-row" [class.high-quantity]="(ingredient.missing * portions()) > 5">
              <span class="ingredient-name">{{ ingredient.ingredientName }}</span>
              <span class="quantity">
                +{{ (ingredient.missing * portions()) | number: '1.2-2' }} {{ ingredient.unit }}
              </span>
            </div>
          }
        </div>
        <div class="total-items">
          Total: {{ data.missingIngredients.length }} ingrédient(s)
        </div>
      </div>

      <div class="modal-actions">
        <button mat-raised-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" (click)="onConfirm()">
          <mat-icon>check_circle</mat-icon>
          Ajouter au panier
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-modal {
      padding: 2rem;
      min-width: 400px;
      max-width: 600px;

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        color: #333;
      }

      .portions-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e0e0e0;

        label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #333;
        }

        .portions-input-group {
          display: flex;
          align-items: center;
          gap: 1rem;

          button {
            transition: all 0.2s;

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }

          .portions-input {
            flex: 1;
            padding: 0.75rem;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            transition: border-color 0.2s;

            &:focus {
              outline: none;
              border-color: #007bff;
            }
          }
        }
      }

      .preview-section {
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;

        h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #333;
        }

        .ingredients-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .ingredient-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: white;
          border-radius: 6px;
          border-left: 4px solid #e0e0e0;
          transition: all 0.2s;

          &.high-quantity {
            border-left-color: #ff9800;
            background: rgba(255, 152, 0, 0.03);
          }

          .ingredient-name {
            font-weight: 500;
            color: #333;
          }

          .quantity {
            font-weight: 600;
            color: #0066cc;
            font-size: 0.95rem;
          }
        }

        .total-items {
          text-align: center;
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;

        button {
          min-width: 140px;

          mat-icon {
            margin-right: 0.5rem;
          }
        }
      }
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;

      &:hover {
        background: #555;
      }
    }
  `]
})
export class CartModalComponent {
  portions = signal(1);
  portionValue = 1;
  displayedIngredients = signal<MissingIngredient[]>([]);

  constructor(
    public dialogRef: MatDialogRef<CartModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recipeName: string; missingIngredients: MissingIngredient[] }
  ) {
    this.updatePortions();
  }

  updatePortions(): void {
    const value = Math.max(1, Math.min(20, this.portionValue));
    this.portionValue = value;
    this.portions.set(value);
    this.displayedIngredients.set(this.data.missingIngredients);
  }

  increasePortions(): void {
    if (this.portions() < 20) {
      this.portionValue = this.portions() + 1;
      this.updatePortions();
    }
  }

  decreasePortions(): void {
    if (this.portions() > 1) {
      this.portionValue = this.portions() - 1;
      this.updatePortions();
    }
  }

  onConfirm(): void {
    this.dialogRef.close(this.portions());
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
