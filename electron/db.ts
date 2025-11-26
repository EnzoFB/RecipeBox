import sqlite3 from 'sqlite3';
import * as path from 'node:path';
import { app } from 'electron';

let db: sqlite3.Database | null = null;

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'recipes.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database:', dbPath);
        createTables().then(() => loadMockData()).then(resolve).catch(reject);
      }
    });
  });
}

function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.serialize(() => {
      // Table ingredients
      db!.run(
        `CREATE TABLE IF NOT EXISTS ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          category TEXT DEFAULT 'Autre',
          unit TEXT,
          image TEXT,
          calories INTEGER,
          protein REAL,
          carbs REAL,
          fat REAL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Table recipes
      db!.run(
        `CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          image TEXT,
          prepTime INTEGER,
          cookTime INTEGER,
          servings INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Table recipe_ingredients (junction table)
      db!.run(
        `CREATE TABLE IF NOT EXISTS recipe_ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipeId INTEGER NOT NULL,
          ingredientId INTEGER NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT,
          FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredientId) REFERENCES ingredients(id) ON DELETE CASCADE,
          UNIQUE(recipeId, ingredientId)
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Table recipe_steps
      db!.run(
        `CREATE TABLE IF NOT EXISTS recipe_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipeId INTEGER NOT NULL,
          stepOrder INTEGER NOT NULL,
          description TEXT NOT NULL,
          FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Table ingredient_stock (stock management)
      db!.run(
        `CREATE TABLE IF NOT EXISTS ingredient_stock (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ingredientId INTEGER NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          expiryDate DATE NOT NULL,
          addedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ingredientId) REFERENCES ingredients(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Add image column if it doesn't exist (migration)
      db!.run(
        `ALTER TABLE recipes ADD COLUMN image TEXT`,
        (err) => {
          // Ignore error if column already exists
          if (err && err.message.includes('duplicate column')) {
            console.log('Image column already exists in recipes');
          } else if (err) {
            console.error('Error adding image column to recipes:', err);
          } else {
            console.log('Image column added successfully to recipes');
          }
        }
      );

      // Add image column to ingredients if it doesn't exist (migration)
      db!.run(
        `ALTER TABLE ingredients ADD COLUMN image TEXT`,
        (err) => {
          // Ignore error if column already exists
          if (err && err.message.includes('duplicate column')) {
            console.log('Image column already exists in ingredients');
          } else if (err) {
            console.error('Error adding image column to ingredients:', err);
          } else {
            console.log('Image column added successfully to ingredients');
          }
          resolve();
        }
      );
    });
  });
}

function loadMockData(): Promise<void> {
  return loadMockDataInternal();
}

async function loadMockDataInternal(): Promise<void> {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Check if data already exists
    const recipeCount = await getAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM recipes'
    );

    if (recipeCount && recipeCount.count > 0) {
      console.log('Mock data already exists, skipping insertion');
      return;
    }

    console.log('Loading mock data...');

    // Insert ingredients
    const ingredients = [
      { name: 'Pâtes', category: 'Féculents', unit: 'g', calories: 131, protein: 5, carbs: 25, fat: 1.1 },
      { name: 'Lard', category: 'Protéines', unit: 'g', calories: 541, protein: 37, carbs: 0, fat: 43 },
      { name: 'Œuf', category: 'Produits laitiers', unit: 'unité', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { name: 'Fromage Parmesan', category: 'Produits laitiers', unit: 'g', calories: 392, protein: 38, carbs: 4, fat: 26 },
      { name: 'Laitue', category: 'Légumes', unit: 'g', calories: 15, protein: 1.2, carbs: 2.9, fat: 0.2 },
      { name: 'Tomate', category: 'Fruits', unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      { name: 'Anchois', category: 'Protéines', unit: 'g', calories: 210, protein: 29, carbs: 0, fat: 11 },
      { name: 'Olives', category: 'Fruits', unit: 'g', calories: 115, protein: 1.5, carbs: 3, fat: 11 },
      { name: 'Crème fraîche', category: 'Produits laitiers', unit: 'g', calories: 340, protein: 2.5, carbs: 3, fat: 36 },
      { name: 'Champignons', category: 'Légumes', unit: 'g', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
      { name: 'Oignon', category: 'Légumes', unit: 'g', calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
      { name: 'Ail', category: 'Condiments', unit: 'g', calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
    ];

    const ingredientIds: Record<string, number> = {};

    for (const ing of ingredients) {
      const id = await insertIngredient(ing);
      ingredientIds[ing.name] = id;
    }

    // Insert recipes
    await insertCarbonara(ingredientIds);
    await insertNicoise(ingredientIds);
    await insertChampignons(ingredientIds);

    console.log('Mock data loaded successfully');
  } catch (error) {
    console.error('Error loading mock data:', error);
    throw error;
  }
}

function insertIngredient(ingredient: any): Promise<number> {
  return new Promise((resolve, reject) => {
    db!.run(
      `INSERT OR IGNORE INTO ingredients (name, category, unit, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ingredient.name, ingredient.category, ingredient.unit, ingredient.calories, ingredient.protein, ingredient.carbs, ingredient.fat],
      function insertCb(this: any, err: any) {
        if (err) {
          reject(err);
        } else {
          getAsync<{ id: number }>('SELECT id FROM ingredients WHERE name = ?', [ingredient.name])
            .then((row) => {
              if (row) {
                resolve(row.id);
              } else {
                resolve(0);
              }
            })
            .catch(reject);
        }
      }
    );
  });
}

function insertRecipe(name: string, description: string, category: string, prepTime: number, cookTime: number, servings: number): Promise<number> {
  return new Promise((resolve, reject) => {
    db!.run(
      `INSERT INTO recipes (name, description, category, prepTime, cookTime, servings)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, category, prepTime, cookTime, servings],
      function insertCb(this: any, err: any) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

async function insertCarbonara(ingredientIds: Record<string, number>): Promise<void> {
  const carbonaraId = await insertRecipe(
    'Pâtes Carbonara',
    'Un classique italien savoureux avec pâtes, lard et œufs',
    'Plats',
    10,
    20,
    4
  );

  const ingredients = [
    { id: ingredientIds['Pâtes'], quantity: 400, unit: 'g' },
    { id: ingredientIds['Lard'], quantity: 200, unit: 'g' },
    { id: ingredientIds['Œuf'], quantity: 3, unit: 'unité' },
    { id: ingredientIds['Fromage Parmesan'], quantity: 100, unit: 'g' },
  ];

  for (const ing of ingredients) {
    await runAsync(
      'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit) VALUES (?, ?, ?, ?)',
      [carbonaraId, ing.id, ing.quantity, ing.unit]
    );
  }

  const steps = [
    'Faire bouillir l\'eau salée',
    'Cuire les pâtes al dente',
    'Faire cuire le lard jusqu\'à croustillant',
    'Mélanger les œufs avec le fromage râpé',
    'Combiner les pâtes avec la sauce et le lard',
  ];

  for (let i = 0; i < steps.length; i++) {
    await runAsync(
      'INSERT INTO recipe_steps (recipeId, stepOrder, description) VALUES (?, ?, ?)',
      [carbonaraId, i + 1, steps[i]]
    );
  }
}

async function insertNicoise(ingredientIds: Record<string, number>): Promise<void> {
  const nicoiseId = await insertRecipe(
    'Salade Niçoise',
    'Une salade fraîche et légère avec tomates, anchois et olives',
    'Salades',
    15,
    0,
    2
  );

  const ingredients = [
    { id: ingredientIds['Laitue'], quantity: 200, unit: 'g' },
    { id: ingredientIds['Tomate'], quantity: 200, unit: 'g' },
    { id: ingredientIds['Anchois'], quantity: 100, unit: 'g' },
    { id: ingredientIds['Olives'], quantity: 100, unit: 'g' },
    { id: ingredientIds['Œuf'], quantity: 2, unit: 'unité' },
  ];

  for (const ing of ingredients) {
    await runAsync(
      'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit) VALUES (?, ?, ?, ?)',
      [nicoiseId, ing.id, ing.quantity, ing.unit]
    );
  }

  const steps = [
    'Laver et sécher la laitue',
    'Couper les tomates en quartiers',
    'Cuire les œufs durs',
    'Assembler la salade avec laitue, tomates, œufs, anchois et olives',
    'Verser l\'huile d\'olive et le vinaigre',
  ];

  for (let i = 0; i < steps.length; i++) {
    await runAsync(
      'INSERT INTO recipe_steps (recipeId, stepOrder, description) VALUES (?, ?, ?)',
      [nicoiseId, i + 1, steps[i]]
    );
  }
}

async function insertChampignons(ingredientIds: Record<string, number>): Promise<void> {
  const champignonsId = await insertRecipe(
    'Champignons à la Crème',
    'Champignons sautés dans une sauce crème délicieuse',
    'Plats',
    10,
    15,
    3
  );

  const ingredients = [
    { id: ingredientIds['Champignons'], quantity: 500, unit: 'g' },
    { id: ingredientIds['Oignon'], quantity: 1, unit: 'unité' },
    { id: ingredientIds['Ail'], quantity: 3, unit: 'g' },
    { id: ingredientIds['Crème fraîche'], quantity: 200, unit: 'g' },
  ];

  for (const ing of ingredients) {
    await runAsync(
      'INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit) VALUES (?, ?, ?, ?)',
      [champignonsId, ing.id, ing.quantity, ing.unit]
    );
  }

  const steps = [
    'Nettoyer et couper les champignons',
    'Hacher l\'oignon et l\'ail',
    'Faire revenir l\'oignon et l\'ail',
    'Ajouter les champignons et cuire 5 minutes',
    'Verser la crème fraîche et cuire 5 minutes de plus',
  ];

  for (let i = 0; i < steps.length; i++) {
    await runAsync(
      'INSERT INTO recipe_steps (recipeId, stepOrder, description) VALUES (?, ?, ?)',
      [champignonsId, i + 1, steps[i]]
    );
  }
}

export function getDatabase(): sqlite3.Database | null {
  return db;
}

export function runAsync(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function getAsync<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

export function allAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve((rows || []) as T[]);
      }
    });
  });
}

export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
