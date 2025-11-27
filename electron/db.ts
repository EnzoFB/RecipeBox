import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import { app } from 'electron';
import { Logger } from './logger';
import { RunAsyncOptions, TableSchema } from './types';

// ============================================================================
// Constants
// ============================================================================

const logger = new Logger('Database');

// ============================================================================
// Database Schemas
// ============================================================================

const SCHEMAS: Record<string, TableSchema> = {
  units: {
    name: 'units',
    sql: `CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL UNIQUE,
      description TEXT
    )`
  },
  ingredients: {
    name: 'ingredients',
    sql: `CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'Autre',
      unitId INTEGER,
      image TEXT,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE SET NULL
    )`
  },
  recipes: {
    name: 'recipes',
    sql: `CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      difficulty INTEGER DEFAULT 2,
      image TEXT,
      prepTime INTEGER,
      cookTime INTEGER,
      servings INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  recipe_ingredients: {
    name: 'recipe_ingredients',
    sql: `CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      ingredientId INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredientId) REFERENCES ingredients(id) ON DELETE CASCADE,
      UNIQUE(recipeId, ingredientId)
    )`
  },
  recipe_steps: {
    name: 'recipe_steps',
    sql: `CREATE TABLE IF NOT EXISTS recipe_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipeId INTEGER NOT NULL,
      stepOrder INTEGER NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
    )`
  },
  ingredient_stock: {
    name: 'ingredient_stock',
    sql: `CREATE TABLE IF NOT EXISTS ingredient_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredientId INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      expiryDate DATE NOT NULL,
      addedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ingredientId) REFERENCES ingredients(id) ON DELETE CASCADE
    )`
  },
  shopping_list: {
    name: 'shopping_list',
    sql: `CREATE TABLE IF NOT EXISTS shopping_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredientId INTEGER NOT NULL,
      quantityNeeded REAL NOT NULL,
      unit TEXT NOT NULL,
      sourceRecipeId INTEGER,
      sourceRecipeName TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ingredientId) REFERENCES ingredients(id) ON DELETE CASCADE,
      FOREIGN KEY (sourceRecipeId) REFERENCES recipes(id) ON DELETE SET NULL
    )`
  }
};

const MIGRATIONS = [
  { table: 'recipes', column: 'difficulty', type: 'INTEGER DEFAULT 2' },
  { table: 'recipes', column: 'image', type: 'TEXT' },
  { table: 'ingredients', column: 'image', type: 'TEXT' },
  { table: 'ingredients', column: 'unitId', type: 'INTEGER REFERENCES units(id) ON DELETE SET NULL' }
];

// ============================================================================
// Database Class
// ============================================================================

class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'recipes.db');
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          this.logError('Failed to connect to database', err);
          reject(err);
        } else {
          this.logInfo(`Connected to SQLite database: ${this.dbPath}`);
          this.createTables()
            .then(() => this.loadMockData())
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create main tables
    for (const schema of Object.values(SCHEMAS)) {
      await this.runAsync({ sql: schema.sql });
    }

    // Apply migrations
    for (const migration of MIGRATIONS) {
      await this.applyMigration(migration.table, migration.column, migration.type);
    }
  }

  private async applyMigration(table: string, column: string, type: string): Promise<void> {
    const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`;
    try {
      await this.runAsync({ sql });
      this.logInfo(`✓ Migration applied: Added ${column} to ${table}`);
    } catch (err: any) {
      if (err.message?.includes('duplicate column')) {
        this.logInfo(`✓ Column ${column} already exists in ${table}`);
      } else {
        this.logError(`Migration failed for ${table}.${column}`, err);
      }
    }
  }

  private async loadMockData(): Promise<void> {
    try {
      const recipeCount = await this.getAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM recipes'
      );

      if (recipeCount && recipeCount.count > 0) {
        this.logInfo('Mock data already exists, skipping insertion');
        return;
      }

      this.logInfo('Loading mock data...');
      await this.insertDefaultUnits();
      const ingredientIds = await this.insertMockIngredients();
      await this.insertMockRecipes(ingredientIds);
      this.logInfo('✓ Mock data loaded successfully');
    } catch (error) {
      this.logError('Error loading mock data', error);
      throw error;
    }
  }

  private async insertDefaultUnits(): Promise<void> {
    const units = [
      { name: 'Gramme', symbol: 'g', description: 'Unité de masse' },
      { name: 'Kilogramme', symbol: 'kg', description: 'Kilogramme' },
      { name: 'Millilitre', symbol: 'ml', description: 'Unité de volume' },
      { name: 'Litre', symbol: 'L', description: 'Litre' },
      { name: 'Centilitre', symbol: 'cl', description: 'Centilitre' },
      { name: 'Cuillère à café', symbol: 'cac', description: 'Cuillère à café (~5ml)' },
      { name: 'Cuillère à soupe', symbol: 'cas', description: 'Cuillère à soupe (~15ml)' },
      { name: 'Verre', symbol: 'verre', description: 'Verre (~250ml)' },
      { name: 'Unité', symbol: 'unité', description: 'Nombre d\'éléments' },
      { name: 'Pincée', symbol: 'pincée', description: 'Pincée' }
    ];

    for (const unit of units) {
      await this.runAsync({
        sql: 'INSERT OR IGNORE INTO units (name, symbol, description) VALUES (?, ?, ?)',
        params: [unit.name, unit.symbol, unit.description]
      });
    }

    this.logInfo('✓ Default units inserted');
  }

  private async insertMockIngredients(): Promise<Record<string, number>> {
    const mockIngredients = [
      { name: 'Pâtes', category: 'Féculents', unit: 'Gramme', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
      { name: 'Lard', category: 'Protéines', unit: 'Gramme', calories: 541, protein: 37, carbs: 0, fat: 43 },
      { name: 'Œuf', category: 'Produits laitiers', unit: 'Unité', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { name: 'Fromage Parmesan', category: 'Produits laitiers', unit: 'Gramme', calories: 392, protein: 38, carbs: 4, fat: 26 },
      { name: 'Laitue', category: 'Légumes', unit: 'Gramme', calories: 15, protein: 1.2, carbs: 2.9, fat: 0.2 },
      { name: 'Tomate', category: 'Fruits', unit: 'Gramme', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      { name: 'Anchois', category: 'Protéines', unit: 'Gramme', calories: 210, protein: 29, carbs: 0, fat: 11 },
      { name: 'Olives', category: 'Fruits', unit: 'Gramme', calories: 115, protein: 1.5, carbs: 3, fat: 11 },
      { name: 'Crème fraîche', category: 'Produits laitiers', unit: 'Gramme', calories: 340, protein: 2.5, carbs: 3, fat: 36 },
      { name: 'Champignons', category: 'Légumes', unit: 'Gramme', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
      { name: 'Oignon', category: 'Légumes', unit: 'Gramme', calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
      { name: 'Ail', category: 'Condiments', unit: 'Gramme', calories: 149, protein: 6.4, carbs: 33, fat: 0.5 }
    ];

    const ingredientIds: Record<string, number> = {};

    for (const ing of mockIngredients) {
      const unitId = await this.getUnitIdByName(ing.unit);
      const id = await this.insertIngredient(ing, unitId);
      ingredientIds[ing.name] = id;
    }

    return ingredientIds;
  }

  private async getUnitIdByName(unitName: string): Promise<number> {
    const unit = await this.getAsync<{ id: number }>(
      'SELECT id FROM units WHERE name = ?',
      [unitName]
    );
    return unit?.id || 1; // Default to 'Gramme' if not found
  }

  private async insertIngredient(ingredient: any, unitId?: number): Promise<number> {
    const sql = `INSERT OR IGNORE INTO ingredients (name, category, unitId, calories, protein, carbs, fat)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    await this.runAsync({
      sql,
      params: [
        ingredient.name,
        ingredient.category,
        unitId || 1,
        ingredient.calories,
        ingredient.protein,
        ingredient.carbs,
        ingredient.fat
      ]
    });

    const row = await this.getAsync<{ id: number }>(
      'SELECT id FROM ingredients WHERE name = ?',
      [ingredient.name]
    );

    return row?.id || 0;
  }

  private async insertMockRecipes(ingredientIds: Record<string, number>): Promise<void> {
    await this.insertCarbonara(ingredientIds);
    await this.insertNicoise(ingredientIds);
    await this.insertChampignons(ingredientIds);
  }

  private async insertCarbonara(ingredientIds: Record<string, number>): Promise<void> {
    const recipeId = await this.insertRecipe(
      'Pâtes Carbonara',
      'Un classique italien savoureux avec pâtes, lard et œufs',
      'Plats',
      10,
      20,
      4,
      2
    );

    const ingredients = [
      { id: ingredientIds['Pâtes'], quantity: 400, unit: 'g' },
      { id: ingredientIds['Lard'], quantity: 200, unit: 'g' },
      { id: ingredientIds['Œuf'], quantity: 3, unit: 'unité' },
      { id: ingredientIds['Fromage Parmesan'], quantity: 100, unit: 'g' }
    ];

    await this.linkRecipeIngredients(recipeId, ingredients);

    const steps = [
      'Faire bouillir l\'eau salée',
      'Cuire les pâtes al dente',
      'Faire cuire le lard jusqu\'à croustillant',
      'Mélanger les œufs avec le fromage râpé',
      'Combiner les pâtes avec la sauce et le lard'
    ];

    await this.insertRecipeSteps(recipeId, steps);
  }

  private async insertNicoise(ingredientIds: Record<string, number>): Promise<void> {
    const recipeId = await this.insertRecipe(
      'Salade Niçoise',
      'Une salade fraîche et légère avec tomates, anchois et olives',
      'Salades',
      15,
      0,
      2,
      1
    );

    const ingredients = [
      { id: ingredientIds['Laitue'], quantity: 200, unit: 'g' },
      { id: ingredientIds['Tomate'], quantity: 200, unit: 'g' },
      { id: ingredientIds['Anchois'], quantity: 100, unit: 'g' },
      { id: ingredientIds['Olives'], quantity: 100, unit: 'g' },
      { id: ingredientIds['Œuf'], quantity: 2, unit: 'unité' }
    ];

    await this.linkRecipeIngredients(recipeId, ingredients);

    const steps = [
      'Laver et sécher la laitue',
      'Couper les tomates en quartiers',
      'Cuire les œufs durs',
      'Assembler la salade avec laitue, tomates, œufs, anchois et olives',
      'Verser l\'huile d\'olive et le vinaigre'
    ];

    await this.insertRecipeSteps(recipeId, steps);
  }

  private async insertChampignons(ingredientIds: Record<string, number>): Promise<void> {
    const recipeId = await this.insertRecipe(
      'Champignons à la Crème',
      'Champignons sautés dans une sauce crème délicieuse',
      'Plats',
      10,
      15,
      3,
      2
    );

    const ingredients = [
      { id: ingredientIds['Champignons'], quantity: 500, unit: 'g' },
      { id: ingredientIds['Oignon'], quantity: 1, unit: 'unité' },
      { id: ingredientIds['Ail'], quantity: 3, unit: 'g' },
      { id: ingredientIds['Crème fraîche'], quantity: 200, unit: 'g' }
    ];

    await this.linkRecipeIngredients(recipeId, ingredients);

    const steps = [
      'Nettoyer et couper les champignons',
      'Hacher l\'oignon et l\'ail',
      'Faire revenir l\'oignon et l\'ail',
      'Ajouter les champignons et cuire 5 minutes',
      'Verser la crème fraîche et cuire 5 minutes de plus'
    ];

    await this.insertRecipeSteps(recipeId, steps);
  }

  private async insertRecipe(
    name: string,
    description: string,
    category: string,
    prepTime: number,
    cookTime: number,
    servings: number,
    difficulty: number = 2
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO recipes (name, description, category, prepTime, cookTime, servings, difficulty)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, [name, description, category, prepTime, cookTime, servings, difficulty], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  private async linkRecipeIngredients(
    recipeId: number,
    ingredients: Array<{ id: number; quantity: number; unit: string }>
  ): Promise<void> {
    for (const ing of ingredients) {
      await this.runAsync({
        sql: 'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit) VALUES (?, ?, ?, ?)',
        params: [recipeId, ing.id, ing.quantity, ing.unit]
      });
    }
  }

  private async insertRecipeSteps(recipeId: number, steps: string[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      await this.runAsync({
        sql: 'INSERT INTO recipe_steps (recipeId, stepOrder, description) VALUES (?, ?, ?)',
        params: [recipeId, i + 1, steps[i]]
      });
    }
  }

  async runAsync({ sql, params = [] }: RunAsyncOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getAsync<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  }

  async allAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve((rows || []) as T[]);
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDatabase(): sqlite3.Database | null {
    return this.db;
  }

  private logInfo(message: string): void {
    logger.info(message);
  }

  private logError(message: string, error: any): void {
    logger.error(message, error);
  }
}

// ============================================================================
// Singleton Instance & Exports
// ============================================================================

let dbManager: DatabaseManager | null = null;

export function initializeDatabase(): Promise<void> {
  dbManager = new DatabaseManager();
  return dbManager.initialize();
}

export function getDatabase(): sqlite3.Database | null {
  return dbManager?.getDatabase() ?? null;
}

export function runAsync(sql: string, params: any[] = []): Promise<void> {
  if (!dbManager) {
    return Promise.reject(new Error('Database not initialized'));
  }
  return dbManager.runAsync({ sql, params });
}

export function getAsync<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  if (!dbManager) {
    return Promise.reject(new Error('Database not initialized'));
  }
  return dbManager.getAsync<T>(sql, params);
}

export function allAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
  if (!dbManager) {
    return Promise.reject(new Error('Database not initialized'));
  }
  return dbManager.allAsync<T>(sql, params);
}

export function closeDatabase(): Promise<void> {
  if (!dbManager) {
    return Promise.resolve();
  }
  return dbManager.close();
}

