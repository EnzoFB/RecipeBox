import { Component, Input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ingredient, INGREDIENT_CATEGORIES } from '../../../core/models';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ingredient-form.component.html',
  styleUrl: './ingredient-form.component.scss'
})
export class IngredientFormComponent implements OnInit {
  @Input() set ingredient(value: Ingredient | null) {
    this._ingredient = value;
    if (value) {
      this.populateForm(value);
    } else {
      this.form.reset();
    }
  }

  form!: FormGroup;
  categories = INGREDIENT_CATEGORIES;
  units = ['g', 'kg', 'ml', 'l', 'c. à soupe', 'c. à café', 'unité'];

  save = output<Omit<Ingredient, 'id'>>();
  cancel = output<void>();

  _ingredient: Ingredient | null = null;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      unit: ['g', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fats: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  private populateForm(ingredient: Ingredient): void {
    this.form.patchValue({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      calories: ingredient.calories || 0,
      protein: ingredient.protein || 0,
      carbs: ingredient.carbs || 0,
      fats: ingredient.fats || 0
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const formData: Omit<Ingredient, 'id'> = {
      name: this.form.get('name')?.value,
      category: this.form.get('category')?.value,
      unit: this.form.get('unit')?.value,
      calories: this.form.get('calories')?.value,
      protein: this.form.get('protein')?.value,
      carbs: this.form.get('carbs')?.value,
      fats: this.form.get('fats')?.value
    };

    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
