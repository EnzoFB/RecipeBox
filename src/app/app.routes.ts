import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'recipes',
    pathMatch: 'full'
  },
  {
    path: 'recipes',
    loadComponent: () => import('./features/recipes/recipes.component').then(m => m.RecipesComponent)
  },
  {
    path: 'recipes/manage',
    loadComponent: () => import('./features/recipes/recipes-management/recipes-management.component').then(m => m.RecipesManagementComponent)
  },
  {
    path: 'recipes/create',
    loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent)
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent)
  },
  {
    path: 'stock',
    loadComponent: () => import('./features/ingredients/stock/stock.component').then(m => m.StockComponent)
  },
  {
    path: 'ingredients',
    loadComponent: () => import('./features/ingredients/ingredients-management/ingredients-management.component').then(m => m.IngredientsManagementComponent)
  },
  {
    path: 'ingredients/create',
    loadComponent: () => import('./features/ingredients/ingredient-page/ingredient-page.component').then(m => m.IngredientPageComponent)
  },
  {
    path: 'ingredients/:id/edit',
    loadComponent: () => import('./features/ingredients/ingredient-page/ingredient-page.component').then(m => m.IngredientPageComponent)
  }
];
