import { Routes } from '@angular/router';

// ============================================================================
// Route Loaders - Lazy loading helpers for better readability
// ============================================================================

const loadRecipesManagement = () =>
  import('./features/recipes/recipes-management/recipes-management.component').then(
    m => m.RecipesManagementComponent
  );

const loadRecipeForm = () =>
  import('./features/recipes/recipe-form/recipe-form-page.component').then(
    m => m.RecipeFormPageComponent
  );

const loadRecipeDetail = () =>
  import('./features/recipes/recipe-detail/recipe-detail.component').then(
    m => m.RecipeDetailComponent
  );

const loadRecipesList = () =>
  import('./features/recipes/recipes.component').then(m => m.RecipesComponent);

const loadIngredientsManagement = () =>
  import('./features/ingredients/ingredients-management/ingredients-management.component').then(
    m => m.IngredientsManagementComponent
  );

const loadIngredientPage = () =>
  import('./features/ingredients/ingredient-form/ingredient-form-page.component').then(
    m => m.IngredientFormPageComponent
  );

const loadStock = () =>
  import('./features/ingredients/stock/stock.component').then(m => m.StockComponent);

const loadShoppingList = () =>
  import('./features/shopping-list/shopping-list.component').then(
    m => m.ShoppingListComponent
  );

// ============================================================================
// Recipe Routes
// ============================================================================

const recipeRoutes: Routes = [
  {
    path: 'manage',
    loadComponent: loadRecipesManagement,
    data: { title: 'Gestion des Recettes' }
  },
  {
    path: 'create',
    loadComponent: loadRecipeForm,
    data: { title: 'Créer une Recette' }
  },
  {
    path: ':id/edit',
    loadComponent: loadRecipeForm,
    data: { title: 'Éditer la Recette' }
  },
  {
    path: ':id',
    loadComponent: loadRecipeDetail,
    data: { title: 'Détail de la Recette' }
  },
  {
    path: '',
    loadComponent: loadRecipesList,
    data: { title: 'Mes Recettes' }
  }
];

// ============================================================================
// Ingredient Routes
// ============================================================================

const ingredientRoutes: Routes = [
  {
    path: 'create',
    loadComponent: loadIngredientPage,
    data: { title: 'Créer un Ingrédient' }
  },
  {
    path: ':id/edit',
    loadComponent: loadIngredientPage,
    data: { title: 'Éditer l\'Ingrédient' }
  },
  {
    path: '',
    loadComponent: loadIngredientsManagement,
    data: { title: 'Gestion des Ingrédients' }
  }
];

// ============================================================================
// Main Routes
// ============================================================================

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'recipes',
    pathMatch: 'full'
  },
  {
    path: 'recipes',
    children: recipeRoutes
  },
  {
    path: 'ingredients',
    children: ingredientRoutes
  },
  {
    path: 'stock',
    loadComponent: loadStock,
    data: { title: 'Gestion du Stock' }
  },
  {
    path: 'shopping-list',
    loadComponent: loadShoppingList,
    data: { title: 'Liste de Courses' }
  }
];
