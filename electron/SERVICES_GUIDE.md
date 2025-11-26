# Guide d'Utilisation - Services Electron Refactorisés

## 🎯 Vue d'Ensemble

La refactorisation introduit une architecture **Services** qui sépare la logique métier de la couche IPC, rendant le code plus maintenable et testable.

## 📚 Services Disponibles

### 1. RecipeService

Gère toutes les opérations liées aux recettes.

```typescript
// Récupérer toutes les recettes
const recipes = await window.electronAPI.recipes.getAll();
// Returns: Recipe[]

// Récupérer une recette spécifique
const recipe = await window.electronAPI.recipes.getById(1);
// Returns: Recipe | null

// Ajouter une nouvelle recette
const id = await window.electronAPI.recipes.add({
  name: 'Carbonara',
  description: 'Pâtes carbonara classiques',
  category: 'Plats',
  prepTime: 10,
  cookTime: 20,
  servings: 4,
  ingredients: [
    { ingredientId: 1, quantity: 400, unit: 'g' },
    { ingredientId: 2, quantity: 200, unit: 'g' }
  ],
  steps: ['Faire bouillir l\'eau', 'Cuire les pâtes', ...]
});

// Mettre à jour une recette
await window.electronAPI.recipes.update(1, {
  name: 'Nouvelle recette',
  ingredients: [...]
});

// Supprimer une recette
await window.electronAPI.recipes.delete(1);
```

### 2. IngredientService

Gère les ingrédients disponibles.

```typescript
// Récupérer tous les ingrédients
const ingredients = await window.electronAPI.ingredients.getAll();

// Ajouter un nouvel ingrédient
const id = await window.electronAPI.ingredients.add({
  name: 'Tomate',
  category: 'Fruits',
  calories: 18,
  protein: 0.9,
  carbs: 3.9,
  fat: 0.2
});

// Mettre à jour un ingrédient
await window.electronAPI.ingredients.update(1, {
  name: 'Tomate Bio',
  calories: 20
});

// Supprimer un ingrédient
await window.electronAPI.ingredients.delete(1);
```

### 3. StockService

Gère le stock des ingrédients et les dates d'expiration.

```typescript
// Récupérer tout le stock
const stock = await window.electronAPI.stock.getAll();

// Ajouter du stock
const id = await window.electronAPI.stock.add({
  ingredientId: 1,
  quantity: 500,
  unit: 'g',
  expiryDate: '2025-12-31'
});

// Mettre à jour le stock
await window.electronAPI.stock.update(1, {
  quantity: 400,
  expiryDate: '2025-12-25'
});

// Supprimer du stock
await window.electronAPI.stock.delete(1);

// 🚨 Récupérer les articles en train d'expirer (7 jours par défaut)
const expiringItems = await window.electronAPI.stock.getExpiring();
```

## 🏗️ Architecture

```
Preload (preload.ts)
    ↓
IPC Main (ipc/handlers.ts)
    ↓
Services (services/*.service.ts)
    ↓
Database (db.ts)
    ↓
SQLite
```

### Flux d'une Requête

1. **Frontend** : Appel via `window.electronAPI.recipes.getAll()`
2. **Preload** : Transmet via `ipcRenderer.invoke('recipes:getAll')`
3. **IPC Handler** : Reçoit et délègue au service
4. **Service** : Exécute la logique métier
5. **Database** : Requête SQL exécutée
6. **Réponse** : Remonte jusqu'au frontend

## 🔍 Logging

Tous les services utilisent un logger centralisé pour tracer les opérations.

### Niveaux de Log

```typescript
logger.debug(message, data?)      // Développement uniquement
logger.info(message, data?)       // Informations générales
logger.warn(message, data?)       // Avertissements
logger.error(message, error?)     // Erreurs
logger.success(message, data?)    // Opérations réussies
```

### Output Exemple

```
2025-11-26T10:30:45.123Z [RecipeService] [INFO] Fetching all recipes
2025-11-26T10:30:45.234Z [RecipeService] [INFO] ✓ Fetched 3 recipes
2025-11-26T10:30:45.345Z [IPCHandlers] [INFO] IPC: recipes:getAll
```

## 🛡️ Gestion d'Erreurs

Les erreurs sont automatiquement gérées et loggées à tous les niveaux.

```typescript
try {
  const recipes = await window.electronAPI.recipes.getAll();
} catch (error) {
  // L'erreur a déjà été loggée côté Electron
  console.error('Frontend error:', error);
}
```

## 📦 Interfaces TypeScript

Tous les modèles sont typés pour une meilleure DX.

### Recipe
```typescript
interface Recipe {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Ingredient
```typescript
interface Ingredient {
  id: number;
  name: string;
  category: string;
  unitId?: number;
  image?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### IngredientStock
```typescript
interface IngredientStock {
  id: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  addedDate?: string;
  name?: string;        // Depuis JOIN avec ingredients
  category?: string;    // Depuis JOIN avec ingredients
}
```

## 🔧 Configuration

La configuration Electron est centralisée dans `config.ts` :

```typescript
const config = getAppConfig();
// {
//   isDevelopment: boolean
//   devServerUrl: 'http://localhost:4200'
//   productionUrl: (buildPath) => 'file://...'
//   window: { width: 1200, height: 800, minWidth: 800, minHeight: 600 }
//   preload: '/path/to/preload.js'
// }
```

## 📊 Exemple Complet : Créer une Recette

```typescript
// Angular Component Example
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recipe-form',
  template: `...`
})
export class RecipeFormComponent {
  async onSubmit(formData: any) {
    try {
      // 1. Récupérer les ingrédients
      const allIngredients = await window.electronAPI.ingredients.getAll();
      
      // 2. Mapper les ingrédients sélectionnés
      const recipeIngredients = formData.ingredients.map(ing => ({
        ingredientId: ing.id,
        quantity: ing.quantity,
        unit: ing.unit
      }));

      // 3. Créer la recette
      const newRecipeId = await window.electronAPI.recipes.add({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        ingredients: recipeIngredients,
        steps: formData.steps
      });

      console.log(`Recette créée avec l'ID: ${newRecipeId}`);
      
      // 4. Rediriger vers le détail
      this.router.navigate(['/recipes', newRecipeId]);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      // Afficher message d'erreur à l'utilisateur
    }
  }
}
```

## 🧪 Tests Recommandés

```typescript
// recipe.service.spec.ts
describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(async () => {
    // Mock database functions
    await initializeDatabase();
  });

  it('should fetch all recipes', async () => {
    const recipes = await service.getAll();
    expect(recipes).toBeDefined();
    expect(Array.isArray(recipes)).toBe(true);
  });

  it('should add a recipe', async () => {
    const newRecipe = {
      name: 'Test Recipe',
      ingredients: [],
      steps: []
    };
    const id = await service.add(newRecipe);
    expect(typeof id).toBe('number');
  });

  it('should delete a recipe', async () => {
    await service.delete(1);
    const recipe = await service.getById(1);
    expect(recipe).toBeNull();
  });
});
```

## 🚀 Performance

### Optimisations Apportées

1. **Lazy Loading** : Les services ne sont instanciés qu'une fois
2. **Logging Conditionnel** : Debug logs uniquement en développement
3. **Requêtes SQL Optimisées** : GROUP_CONCAT pour les relations
4. **Gestion Mémoire** : Fermeture DB au quit de l'app

### Monitoring

Vérifier les logs pour identifier les goulots d'étranglement :

```bash
# En développement
[RecipeService] [DEBUG] Fetching all recipes
[RecipeService] [DEBUG] Fetched 3 recipes
```

## 📋 Checklist Intégration Frontend

- [ ] Importer les types depuis types.ts
- [ ] Utiliser les services via window.electronAPI
- [ ] Gérer les erreurs correctement
- [ ] Afficher les logs en développement
- [ ] Tester avec vraies données
- [ ] Vérifier les dates d'expiration
- [ ] Implémenter debounce pour éditions fréquentes

## ⚠️ Migration depuis Ancien Code

Si vous aviez du code utilisant `allAsync`, `getAsync` directement :

```typescript
// ❌ AVANT
const recipes = await allAsync('SELECT * FROM recipes');

// ✅ APRÈS
const recipeService = new RecipeService();
const recipes = await recipeService.getAll();

// Ou via IPC
const recipes = await window.electronAPI.recipes.getAll();
```

## 📞 Support

Pour ajouter de nouveaux endpoints :

1. Créer la méthode dans le service approprié
2. Ajouter le handler dans `ipc/handlers.ts`
3. Exposer via `preload.ts`
4. Documenter dans ce guide

---

**Documentation mise à jour** : 26 novembre 2025
