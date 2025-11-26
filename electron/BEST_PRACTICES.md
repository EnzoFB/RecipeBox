# Bonnes Pratiques & Patterns - Electron Refactorisé

## 🎯 Principes Fondamentaux

### 1. Single Responsibility Principle (SRP)
Chaque classe/fichier a **une seule responsabilité**.

```typescript
// ✅ BON : Services avec une responsabilité unique
export class RecipeService { /* recettes */ }
export class IngredientService { /* ingrédients */ }
export class StockService { /* stock */ }

// ❌ MAUVAIS : Tout mélangé
export class DatabaseService { /* fait tout */ }
```

### 2. Separation of Concerns (SoC)

```
┌─────────────────┐
│  IPC Handler    │  (Reçoit/Envoie via Electron)
├─────────────────┤
│  Service Layer  │  (Logique métier)
├─────────────────┤
│  Database Layer │  (Requêtes SQL)
└─────────────────┘
```

**N'écrivez JAMAIS** de logique métier dans un handler IPC.

### 3. Dependency Injection

```typescript
// ❌ À ÉVITER : Tight coupling
class RecipeService {
  private db = getDatabase();  // Couplé directement
}

// ✅ RECOMMANDÉ : Services autonomes
export class RecipeService {
  // Utilise les exports de db.ts
  // Facilement mockable pour tests
}
```

## 📝 Patterns d'Ajout de Nouvelles Fonctionnalités

### Scenario : Ajouter un Service Unit

#### Étape 1 : Créer l'interface (types.ts)
```typescript
export interface Unit {
  id: number;
  name: string;
  symbol: string;
}
```

#### Étape 2 : Créer le Service (services/unit.service.ts)
```typescript
import { Logger } from '../logger';
import { Unit } from '../types';
import { allAsync, runAsync, getDatabase } from '../db';

const logger = new Logger('UnitService');

export class UnitService {
  async getAll(): Promise<Unit[]> {
    try {
      logger.debug('Fetching all units');
      return await allAsync<Unit>('SELECT * FROM units');
    } catch (error) {
      logger.error('Failed to fetch units', error);
      throw error;
    }
  }

  async add(unit: Omit<Unit, 'id'>): Promise<number> {
    try {
      logger.debug(`Adding unit: ${unit.name}`);
      // ... implementation
    } catch (error) {
      logger.error('Failed to add unit', error);
      throw error;
    }
  }
}
```

#### Étape 3 : Ajouter les IPC Handlers (ipc/handlers.ts)
```typescript
const unitService = new UnitService();

export function registerUnitHandlers(): void {
  ipcMain.handle('units:getAll', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: units:getAll');
      return await unitService.getAll();
    } catch (error) {
      handleIpcError('units:getAll', error);
      throw error;
    }
  });

  ipcMain.handle('units:add', async (_event: IpcMainInvokeEvent, unit: any) => {
    try {
      logger.debug('IPC: units:add');
      return await unitService.add(unit);
    } catch (error) {
      handleIpcError('units:add', error);
      throw error;
    }
  });

  logger.info('✓ Unit IPC handlers registered');
}

// Dans registerAllHandlers()
export function registerAllHandlers(): void {
  registerRecipeHandlers();
  registerIngredientHandlers();
  registerStockHandlers();
  registerUnitHandlers();  // ← AJOUTER ICI
  logger.success('All IPC handlers registered');
}
```

#### Étape 4 : Exposer via Preload (preload.ts)
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  recipes: { /* ... */ },
  ingredients: { /* ... */ },
  stock: { /* ... */ },
  units: {  // ← AJOUTER ICI
    getAll: () => ipcRenderer.invoke('units:getAll'),
    add: (unit: any) => ipcRenderer.invoke('units:add', unit),
    update: (id: number, unit: any) => ipcRenderer.invoke('units:update', id, unit),
    delete: (id: number) => ipcRenderer.invoke('units:delete', id),
  },
});
```

## 🔐 Bonnes Pratiques de Sécurité

### 1. Validation des Entrées

```typescript
// ✅ RECOMMANDÉ : Valider les données
async add(unit: Omit<Unit, 'id'>): Promise<number> {
  // Valider avant DB
  if (!unit.name || unit.name.trim() === '') {
    throw new Error('Unit name cannot be empty');
  }
  if (!unit.symbol || unit.symbol.trim() === '') {
    throw new Error('Unit symbol cannot be empty');
  }
  
  logger.debug(`Adding unit: ${unit.name}`);
  // ... rest of implementation
}
```

### 2. Parameterized Queries (Déjà en place ✅)

```typescript
// ✅ PROTÉGÉ contre SQL injection
await runAsync('SELECT * FROM ingredients WHERE id = ?', [id]);

// ❌ DANGEREUX
await runAsync(`SELECT * FROM ingredients WHERE id = ${id}`);
```

### 3. Context Isolation (Déjà en place ✅)

```typescript
// preload.ts - Éxposé de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', { /* ... */ });

// ✅ Protégé contre XSS
// ❌ main.ts : nodeIntegration: false, contextIsolation: true
```

## 🧪 Stratégies de Test

### Test Unitaire Service

```typescript
// recipe.service.spec.ts
describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(async () => {
    await initializeDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('getAll', () => {
    it('should return array of recipes', async () => {
      const recipes = await service.getAll();
      expect(Array.isArray(recipes)).toBe(true);
    });

    it('should include recipe details', async () => {
      const recipes = await service.getAll();
      if (recipes.length > 0) {
        expect(recipes[0]).toHaveProperty('id');
        expect(recipes[0]).toHaveProperty('name');
        expect(recipes[0]).toHaveProperty('ingredients');
        expect(recipes[0]).toHaveProperty('steps');
      }
    });
  });

  describe('add', () => {
    it('should add recipe and return ID', async () => {
      const newRecipe = {
        name: 'Test Recipe',
        ingredients: [],
        steps: ['Step 1']
      };
      const id = await service.add(newRecipe);
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });
  });
});
```

### Test IPC Handler (Mock)

```typescript
// ipc/handlers.spec.ts
describe('IPC Handlers', () => {
  it('should handle recipes:getAll', async () => {
    const mockRecipes = [{ id: 1, name: 'Test' }];
    
    // Mock le service
    jest.spyOn(recipeService, 'getAll')
      .mockResolvedValue(mockRecipes as any);

    const handler = ipcMain._eventNames()
      .find(name => name === 'recipes:getAll');
    
    expect(handler).toBeDefined();
  });
});
```

## 📊 Monitoring & Debugging

### 1. Enable Dev Tools

```typescript
// config.ts
export const getAppConfig = (): AppConfig => {
  // ...
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }
};
```

### 2. Logs Structurés

```typescript
// Bon pour parseage automatique
logger.info('Recipe created', { id: 123, name: 'Carbonara' });

// Output: 
// 2025-11-26T10:30:45.123Z [RecipeService] [INFO] Recipe created 
// {
//   "id": 123,
//   "name": "Carbonara"
// }
```

### 3. Performance Monitoring

```typescript
async getAll(): Promise<Recipe[]> {
  const startTime = performance.now();
  
  try {
    logger.debug('Fetching all recipes');
    const recipes = await allAsync<Recipe>('SELECT * FROM recipes');
    
    const duration = performance.now() - startTime;
    logger.debug(`Fetched ${recipes.length} recipes in ${duration.toFixed(2)}ms`);
    
    return recipes;
  } catch (error) {
    logger.error('Failed to fetch recipes', error);
    throw error;
  }
}
```

## 🚀 Performance Optimization

### 1. Pagination pour Grandes Listes

```typescript
async getAll(page = 1, pageSize = 50): Promise<Recipe[]> {
  const offset = (page - 1) * pageSize;
  return await allAsync<Recipe>(
    'SELECT * FROM recipes LIMIT ? OFFSET ?',
    [pageSize, offset]
  );
}
```

### 2. Caching Simple

```typescript
class RecipeService {
  private cache: Map<number, Recipe> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async getById(id: number): Promise<Recipe | null> {
    const cached = this.cache.get(id);
    if (cached) {
      logger.debug(`Cache hit for recipe ${id}`);
      return cached;
    }

    const recipe = await getAsync<Recipe>('SELECT * FROM recipes WHERE id = ?', [id]);
    if (recipe) {
      this.cache.set(id, recipe);
      setTimeout(() => this.cache.delete(id), this.cacheExpiry);
    }
    return recipe || null;
  }

  invalidateCache(id?: number): void {
    if (id) {
      this.cache.delete(id);
    } else {
      this.cache.clear();
    }
  }
}
```

### 3. Batch Operations

```typescript
// ❌ LENT : Boucles individuelles
for (const ingredient of ingredients) {
  await runAsync('INSERT INTO recipe_ingredients ...', [recipe.id, ingredient...]);
}

// ✅ RAPIDE : Transaction (recommandé)
// Implémenter une transaction wrapper
async addRecipeInTransaction(recipe: Recipe): Promise<number> {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db?.serialize(() => {
      db.run('BEGIN TRANSACTION');
      // ...operations...
      db.run('COMMIT', (err) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
        } else {
          resolve(recipeId);
        }
      });
    });
  });
}
```

## 📚 Structure de Fichier Recommandée

```
electron/
├── main.ts                 # Point d'entrée
├── preload.ts             # Exposition API
├── config.ts              # Configuration
├── logger.ts              # Logging utility
├── types.ts               # Type definitions
├── db.ts                  # Database manager
├── services/
│   ├── index.ts          # Barrel export
│   ├── recipe.service.ts
│   ├── ingredient.service.ts
│   ├── stock.service.ts
│   └── unit.service.ts    # (À ajouter)
├── ipc/
│   ├── handlers.ts        # IPC registry
│   └── middleware.ts      # (Optionnel : Auth, rate-limit)
└── utils/                 # (Optionnel)
    ├── validators.ts      # Validation schemas
    └── formatters.ts      # Data formatters
```

## 🔄 Workflow Recommandé

1. **Écrire le test** (TDD)
2. **Implémenter le service**
3. **Ajouter IPC handler**
4. **Exposer via preload**
5. **Tester via frontend**
6. **Documenter**

## ⚠️ Anti-Patterns à Éviter

```typescript
// ❌ Ne PAS faire :

// 1. Logique métier dans les handlers
ipcMain.handle('recipes:getAll', async () => {
  const recipes = await allAsync('SELECT...');
  return recipes.map(r => ({ ...r, special: r.id * 2 })); // ← MAUVAIS
});

// 2. Appels directs à la DB
async someMethod() {
  const db = getDatabase();
  db.run('SELECT...'); // ← Pas de type checking
}

// 3. Mix de synchrone/asynchrone
const recipe = await getRecipeSync(); // ❌ N'existe pas
const ingredients = getIngredientsAsync(); // ❌ Sans await

// 4. Erreurs non loggées
try {
  await service.add(data);
} catch (error) {
  // Silencieux ❌
}

// 5. Types génériques excessifs
async getAll(): Promise<any[]> { // ❌ any = pas de type checking
```

## ✅ Checklist Qualité Code

- [ ] Tous les handlers en IPC handler seulement
- [ ] Logique métier dans les services
- [ ] Logger utilisé partout
- [ ] Types TypeScript stricts (pas de `any`)
- [ ] Gestion d'erreurs complète
- [ ] Parameterized queries pour SQL
- [ ] Tests unitaires pour services
- [ ] Documentation pour nouveaux endpoints
- [ ] Performance vérifiée (console perf)
- [ ] Sécurité validée (audit OWASP simple)

---

**Dernière mise à jour** : 26 novembre 2025
