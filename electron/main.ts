import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';
import { initializeDatabase, closeDatabase, allAsync, getAsync, runAsync } from './db';

let mainWindow: BrowserWindow | null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  const startUrl = isDevelopment
    ? 'http://localhost:4200'
    : `file://${path.join(__dirname, '../browser/index.html')}`;

  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(startUrl);

  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// IPC Handlers for Recipes
ipcMain.handle('recipes:getAll', async () => {
  try {
    const recipes = await allAsync<any>(`
      SELECT r.*, 
             GROUP_CONCAT(ri.ingredientId || ':' || ri.quantity || ':' || ri.unit) as ingredientsList
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
      GROUP BY r.id
      ORDER BY r.createdAt DESC
    `);
    
    return recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredientsList 
        ? recipe.ingredientsList.split(',').map((ing: string) => {
            const [ingredientId, quantity, unit] = ing.split(':');
            return { ingredientId: parseInt(ingredientId), quantity: parseFloat(quantity), unit };
          })
        : []
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
});

ipcMain.handle('recipes:getById', async (_, id: number) => {
  try {
    const recipe = await getAsync<any>('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!recipe) return null;

    const ingredients = await allAsync<any>(`
      SELECT ri.ingredientId, ri.quantity, ri.unit
      FROM recipe_ingredients ri
      WHERE ri.recipeId = ?
    `, [id]);

    const steps = await allAsync<any>(`
      SELECT description FROM recipe_steps
      WHERE recipeId = ?
      ORDER BY stepOrder ASC
    `, [id]);

    return {
      ...recipe,
      ingredients,
      steps: steps.map((s: any) => s.description)
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
});

ipcMain.handle('recipes:add', async (_, recipe: any) => {
  try {
    const result = await new Promise<{ id: number }>((resolve, reject) => {
      const db = require('./db').getDatabase();
      db.run(
        `INSERT INTO recipes (name, description, category, image, prepTime, cookTime, servings)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [recipe.name, recipe.description, recipe.category, recipe.image || null, recipe.prepTime, recipe.cookTime, recipe.servings],
        function(this: any, err: any) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Add ingredients
    for (const ingredient of recipe.ingredients) {
      await runAsync(
        `INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [result.id, ingredient.ingredientId, ingredient.quantity, ingredient.unit]
      );
    }

    // Add steps
    for (let i = 0; i < recipe.steps.length; i++) {
      await runAsync(
        `INSERT INTO recipe_steps (recipeId, stepOrder, description)
         VALUES (?, ?, ?)`,
        [result.id, i + 1, recipe.steps[i]]
      );
    }

    return result.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
});

ipcMain.handle('recipes:update', async (_, id: number, recipe: any) => {
  try {
    await runAsync(
      `UPDATE recipes 
       SET name = ?, description = ?, category = ?, image = ?, prepTime = ?, cookTime = ?, servings = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [recipe.name, recipe.description, recipe.category, recipe.image || null, recipe.prepTime, recipe.cookTime, recipe.servings, id]
    );

    // Delete and re-add ingredients
    await runAsync('DELETE FROM recipe_ingredients WHERE recipeId = ?', [id]);
    for (const ingredient of recipe.ingredients) {
      await runAsync(
        `INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [id, ingredient.ingredientId, ingredient.quantity, ingredient.unit]
      );
    }

    // Delete and re-add steps
    await runAsync('DELETE FROM recipe_steps WHERE recipeId = ?', [id]);
    for (let i = 0; i < recipe.steps.length; i++) {
      await runAsync(
        `INSERT INTO recipe_steps (recipeId, stepOrder, description)
         VALUES (?, ?, ?)`,
        [id, i + 1, recipe.steps[i]]
      );
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
});

ipcMain.handle('recipes:delete', async (_, id: number) => {
  try {
    await runAsync('DELETE FROM recipes WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
});

// IPC Handlers for Ingredients
ipcMain.handle('ingredients:getAll', async () => {
  try {
    return await allAsync('SELECT * FROM ingredients ORDER BY name ASC');
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    throw error;
  }
});

ipcMain.handle('ingredients:add', async (_, ingredient: any) => {
  try {
    const result = await new Promise<{ id: number }>((resolve, reject) => {
      const db = require('./db').getDatabase();
      db.run(
        `INSERT INTO ingredients (name, unit, calories, protein, carbs, fat)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ingredient.name, ingredient.unit, ingredient.calories, ingredient.protein, ingredient.carbs, ingredient.fat],
        function(this: any, err: any) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    return result.id;
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
});

ipcMain.handle('ingredients:update', async (_, id: number, ingredient: any) => {
  try {
    await runAsync(
      `UPDATE ingredients 
       SET name = ?, unit = ?, calories = ?, protein = ?, carbs = ?, fat = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [ingredient.name, ingredient.unit, ingredient.calories, ingredient.protein, ingredient.carbs, ingredient.fat, id]
    );
  } catch (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }
});

ipcMain.handle('ingredients:delete', async (_, id: number) => {
  try {
    await runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
});

// IPC Handlers for Ingredient Stock
ipcMain.handle('stock:getAll', async () => {
  try {
    return await allAsync<any>(`
      SELECT s.*, i.name, i.category
      FROM ingredient_stock s
      JOIN ingredients i ON s.ingredientId = i.id
      ORDER BY s.expiryDate ASC
    `);
  } catch (error) {
    console.error('Error fetching stock:', error);
    throw error;
  }
});

ipcMain.handle('stock:add', async (_, stock: any) => {
  try {
    const result = await new Promise<{ id: number }>((resolve, reject) => {
      const db = require('./db').getDatabase();
      db.run(
        `INSERT INTO ingredient_stock (ingredientId, quantity, unit, expiryDate)
         VALUES (?, ?, ?, ?)`,
        [stock.ingredientId, stock.quantity, stock.unit, stock.expiryDate],
        function(this: any, err: any) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    return result.id;
  } catch (error) {
    console.error('Error adding stock:', error);
    throw error;
  }
});

ipcMain.handle('stock:update', async (_, id: number, stock: any) => {
  try {
    await runAsync(
      `UPDATE ingredient_stock 
       SET quantity = ?, unit = ?, expiryDate = ?
       WHERE id = ?`,
      [stock.quantity, stock.unit, stock.expiryDate, id]
    );
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
});

ipcMain.handle('stock:delete', async (_, id: number) => {
  try {
    await runAsync('DELETE FROM ingredient_stock WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting stock:', error);
    throw error;
  }
});

ipcMain.handle('stock:getExpiring', async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return await allAsync<any>(`
      SELECT s.*, i.name, i.category
      FROM ingredient_stock s
      JOIN ingredients i ON s.ingredientId = i.id
      WHERE s.expiryDate BETWEEN ? AND ?
      ORDER BY s.expiryDate ASC
    `, [today, sevenDaysFromNow]);
  } catch (error) {
    console.error('Error fetching expiring stock:', error);
    throw error;
  }
});

app.on('ready', async () => {
  try {
    await initializeDatabase();
    createWindow();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
