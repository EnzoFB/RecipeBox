# 🚀 Quick Start - Electron Refactorisé

## Installation & Compilation

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler le code Electron
npm run build:electron

# 3. Lancer l'app
npm start

# Ou en développement avec Angular DevServer
npm run watch          # Terminal 1: Angular watch
npm start:dev          # Terminal 2: Electron dev
```

## Structure des Fichiers Principaux

### 1. **electron/main.ts** (Point d'Entrée)
- Création de la fenêtre
- Initialisation de la base de données
- Enregistrement des handlers IPC
- ~70 lignes (ultra-lean)

### 2. **electron/services/** (Logique Métier)
- `recipe.service.ts` - Gestion recettes
- `ingredient.service.ts` - Gestion ingrédients
- `stock.service.ts` - Gestion stock
- Chaque service : ~100 lignes

### 3. **electron/ipc/handlers.ts** (API Electron)
- Enregistre tous les endpoints IPC
- Délègue aux services
- Gère les erreurs centralement

### 4. **electron/config.ts** (Configuration)
- URLs dev/prod
- Dimensions fenêtre
- Chemins fichiers

### 5. **electron/types.ts** (Types TypeScript)
- Interfaces Recipe, Ingredient, Stock
- Contrats IPC typés

### 6. **electron/logger.ts** (Logging)
- Logger avec niveaux
- Timestamps automatiques
- Debug mode en développement

## Premiers Pas : Modifier un Service

### Exemple : Ajouter une Colonne à Ingredient

#### 1️⃣ Mettre à Jour la Base de Données
```typescript
// electron/db.ts - Section MIGRATIONS
const MIGRATIONS = [
  { table: 'ingredients', column: 'image', type: 'TEXT' },
  { table: 'ingredients', column: 'unitId', type: 'INTEGER' },
  { table: 'ingredients', column: 'origin', type: 'TEXT' },  // ← AJOUTER
];
```

#### 2️⃣ Mettre à Jour le Type
```typescript
// electron/types.ts
export interface Ingredient {
  id: number;
  name: string;
  category: string;
  unitId?: number;
  image?: string;
  origin?: string;  // ← AJOUTER
  calories?: number;
  // ...
}
```

#### 3️⃣ Mettre à Jour le Service
```typescript
// electron/services/ingredient.service.ts
async add(ingredient: Omit<Ingredient, 'id'>): Promise<number> {
  // ...
  db.run(
    `INSERT INTO ingredients (name, category, unitId, calories, protein, carbs, fat, origin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,  // ← AJOUTER ?
    [
      ingredient.name,
      ingredient.category || 'Autre',
      ingredient.unitId || null,
      ingredient.calories || null,
      ingredient.protein || null,
      ingredient.carbs || null,
      ingredient.fat || null,
      ingredient.origin || null  // ← AJOUTER
    ],
    // ...
  );
}
```

#### 4️⃣ Tester
```bash
npm run build:electron
npm start
```

## Débogage

### Voir les Logs
```bash
# Terminal: Ouvrir Dev Tools automatiquement
# Dans config.ts, isDevelopment ouvre automatiquement Dev Tools

# Ou manuellement: Ctrl+Shift+I dans Electron
```

### Logs Exemples
```
2025-11-26T10:30:45.123Z [Database] [INFO] Connected to SQLite database: /path/to/recipes.db
2025-11-26T10:30:45.234Z [Database] [INFO] ✓ Default units inserted
2025-11-26T10:30:45.345Z [RecipeService] [DEBUG] Fetching all recipes
2025-11-26T10:30:45.456Z [RecipeService] [DEBUG] Fetched 3 recipes in 15.23ms
2025-11-26T10:30:45.567Z [IPCHandlers] [INFO] ✓ All IPC handlers registered
```

### Vérifier les Types TypeScript
```bash
# Compilation
npm run build:electron

# Pas de "error" = succès ✅
```

## Ajouter un Nouvel Endpoint API

### Exemple : Obtenir Recettes par Catégorie

#### 1️⃣ Ajouter au Service
```typescript
// electron/services/recipe.service.ts
async getByCategory(category: string): Promise<Recipe[]> {
  try {
    logger.debug(`Fetching recipes for category: ${category}`);
    
    const recipes = await allAsync<any>(`
      SELECT r.*, 
             GROUP_CONCAT(ri.ingredientId || ':' || ri.quantity || ':' || ri.unit) as ingredientsList
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
      WHERE r.category = ?
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `, [category]);
    
    return recipes.map(recipe => this.parseRecipeWithIngredients(recipe));
  } catch (error) {
    logger.error('Failed to fetch recipes by category', error);
    throw error;
  }
}
```

#### 2️⃣ Ajouter Handler IPC
```typescript
// electron/ipc/handlers.ts
ipcMain.handle('recipes:getByCategory', async (_event: IpcMainInvokeEvent, category: string) => {
  try {
    logger.debug(`IPC: recipes:getByCategory (${category})`);
    return await recipeService.getByCategory(category);
  } catch (error) {
    handleIpcError('recipes:getByCategory', error);
    throw error;
  }
});
```

#### 3️⃣ Exposer en Frontend
```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  recipes: {
    getAll: () => ipcRenderer.invoke('recipes:getAll'),
    getById: (id: number) => ipcRenderer.invoke('recipes:getById', id),
    getByCategory: (category: string) => ipcRenderer.invoke('recipes:getByCategory', category),  // ← AJOUTER
    add: (recipe: any) => ipcRenderer.invoke('recipes:add', recipe),
    // ...
  },
});
```

#### 4️⃣ Utiliser en Angular
```typescript
// src/app/features/recipes/recipes.component.ts
async loadRecipesByCategory(category: string) {
  try {
    const recipes = await window.electronAPI.recipes.getByCategory(category);
    this.recipes = recipes;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Tests Rapides

```bash
# Compiler
npm run build:electron

# Lancer
npm start

# Tester dans la Console DevTools
window.electronAPI.recipes.getAll()
  .then(recipes => console.log('Recettes:', recipes))
  .catch(error => console.error('Erreur:', error));

window.electronAPI.ingredients.getAll()
  .then(ings => console.log('Ingrédients:', ings));

window.electronAPI.stock.getExpiring()
  .then(expiring => console.log('À expiration:', expiring));
```

## Fichiers de Documentation

| Fichier | Contenu |
|---------|---------|
| `ELECTRON_REFACTOR.md` | Résumé refactorisation |
| `SERVICES_GUIDE.md` | Guide d'utilisation services |
| `BEST_PRACTICES.md` | Bonnes pratiques & patterns |
| `QUICK_START.md` | Ce fichier |

## Commandes Utiles

```bash
# Développement
npm run build:electron      # Compiler TypeScript
npm start                   # Lancer avec ng build
npm start:dev              # Lancer avec electron-forge
npm run build              # Build Angular
npm run watch              # Watch Angular

# Production
npm run package            # Package l'app
npm run make               # Build installable

# Tests
npm test                   # Tests Angular
npm test:ci                # CI tests
```

## Dépannage

### "Cannot find module './logger'"
- Vérifier que le chemin import est relatif correct: `import { Logger } from '../logger';`

### "Database not initialized"
- Vérifier que `initializeDatabase()` est appelé dans `app.on('ready')`
- Vérifier les logs pour les erreurs d'initialisation

### Erreur "contextIsolation: true required"
- Vérifier `main.ts` : `contextIsolation: true`
- Vérifier `preload.ts` utilise `contextBridge.exposeInMainWorld`

### Les services ne répondent pas
- Ouvrir DevTools (Ctrl+Shift+I)
- Regarder les logs Electron
- Vérifier que les handlers sont enregistrés: `registerAllHandlers()`

### Port 4200 en conflit
- Changer dans `config.ts`: `devServerUrl: 'http://localhost:4201'`
- Ou lancer Angular sur port différent: `ng serve --port 4201`

## Prochaines Améliorations

- [ ] Ajouter des validateurs (Zod/Joi)
- [ ] Implémenter transactions DB
- [ ] Ajouter rate-limiting IPC
- [ ] Caching simple
- [ ] Unit tests pour services
- [ ] E2E tests
- [ ] Migration DB automatique
- [ ] Export/Import données

## 📚 Ressources

- [Electron Docs](https://www.electronjs.org/docs)
- [SQLite3 Node](https://github.com/TryGhost/node-sqlite3)
- [Angular Electron Patterns](https://angular.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💬 Questions Fréquentes

**Q: Comment partager un service avec le renderer?**
A: Utiliser IPC handlers + exposeInMainWorld, jamais d'accès direct.

**Q: Puis-je utiliser async/await partout?**
A: Oui, c'est déjà fait dans toute la base de code.

**Q: Les types TypeScript sont obligatoires?**
A: Non, mais fortement recommandés. Voir `types.ts`.

**Q: Puis-je modifier la DB pendant le runtime?**
A: Oui, migrations supportées dans `db.ts`, relancer l'app.

---

**Créé** : 26 novembre 2025
**Dernière mise à jour** : 26 novembre 2025
