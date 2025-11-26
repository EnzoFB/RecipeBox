/**
 * Recipe Service - Handles all recipe-related database operations
 */

import { Logger } from '../logger';
import { Recipe, RecipeIngredient } from '../types';
import { allAsync, getAsync, runAsync, getDatabase } from '../db';

const logger = new Logger('RecipeService');

export class RecipeService {
  async getAll(): Promise<Recipe[]> {
    try {
      logger.debug('Fetching all recipes');
      
      const recipes = await allAsync<any>(`
        SELECT r.*, 
               GROUP_CONCAT(ri.ingredientId || ':' || ri.quantity || ':' || ri.unit) as ingredientsList
        FROM recipes r
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipeId
        GROUP BY r.id
        ORDER BY r.createdAt DESC
      `);
      
      return recipes.map(recipe => this.parseRecipeWithIngredients(recipe));
    } catch (error) {
      logger.error('Failed to fetch all recipes', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Recipe | null> {
    try {
      logger.debug(`Fetching recipe with id: ${id}`);
      
      const recipe = await getAsync<any>('SELECT * FROM recipes WHERE id = ?', [id]);
      if (!recipe) {
        logger.warn(`Recipe not found: ${id}`);
        return null;
      }

      const ingredients = await allAsync<RecipeIngredient>(`
        SELECT ingredientId, quantity, unit
        FROM recipe_ingredients
        WHERE recipeId = ?
      `, [id]);

      const steps = await allAsync<{ description: string }>(`
        SELECT description FROM recipe_steps
        WHERE recipeId = ?
        ORDER BY stepOrder ASC
      `, [id]);

      return {
        ...recipe,
        ingredients,
        steps: steps.map(s => s.description)
      };
    } catch (error) {
      logger.error(`Failed to fetch recipe ${id}`, error);
      throw error;
    }
  }

  async add(recipe: Omit<Recipe, 'id'>): Promise<number> {
    try {
      logger.debug('Adding new recipe', { name: recipe.name });
      
      const result = await new Promise<{ id: number }>((resolve, reject) => {
        const db = getDatabase();
        if (!db) {
          reject(new Error('Database not initialized'));
          return;
        }

        db.run(
          `INSERT INTO recipes (name, description, category, image, prepTime, cookTime, servings)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            recipe.name,
            recipe.description || null,
            recipe.category || null,
            recipe.image || null,
            recipe.prepTime || null,
            recipe.cookTime || null,
            recipe.servings || null
          ],
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

      logger.success(`Recipe added with id: ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Failed to add recipe', error);
      throw error;
    }
  }

  async update(id: number, recipe: Partial<Recipe>): Promise<void> {
    try {
      logger.debug(`Updating recipe ${id}`);
      
      await runAsync(
        `UPDATE recipes 
         SET name = COALESCE(?, name),
             description = COALESCE(?, description),
             category = COALESCE(?, category),
             image = COALESCE(?, image),
             prepTime = COALESCE(?, prepTime),
             cookTime = COALESCE(?, cookTime),
             servings = COALESCE(?, servings),
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          recipe.name || null,
          recipe.description || null,
          recipe.category || null,
          recipe.image || null,
          recipe.prepTime || null,
          recipe.cookTime || null,
          recipe.servings || null,
          id
        ]
      );

      // Update ingredients if provided
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        await runAsync('DELETE FROM recipe_ingredients WHERE recipeId = ?', [id]);
        for (const ingredient of recipe.ingredients) {
          await runAsync(
            `INSERT INTO recipe_ingredients (recipeId, ingredientId, quantity, unit)
             VALUES (?, ?, ?, ?)`,
            [id, ingredient.ingredientId, ingredient.quantity, ingredient.unit]
          );
        }
      }

      // Update steps if provided
      if (recipe.steps && recipe.steps.length > 0) {
        await runAsync('DELETE FROM recipe_steps WHERE recipeId = ?', [id]);
        for (let i = 0; i < recipe.steps.length; i++) {
          await runAsync(
            `INSERT INTO recipe_steps (recipeId, stepOrder, description)
             VALUES (?, ?, ?)`,
            [id, i + 1, recipe.steps[i]]
          );
        }
      }

      logger.success(`Recipe ${id} updated`);
    } catch (error) {
      logger.error(`Failed to update recipe ${id}`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      logger.debug(`Deleting recipe ${id}`);
      
      await runAsync('DELETE FROM recipes WHERE id = ?', [id]);
      logger.success(`Recipe ${id} deleted`);
    } catch (error) {
      logger.error(`Failed to delete recipe ${id}`, error);
      throw error;
    }
  }

  private parseRecipeWithIngredients(recipe: any): Recipe {
    return {
      ...recipe,
      ingredients: recipe.ingredientsList
        ? recipe.ingredientsList.split(',').map((ing: string) => {
            const [ingredientId, quantity, unit] = ing.split(':');
            return {
              ingredientId: Number.parseInt(ingredientId),
              quantity: Number.parseFloat(quantity),
              unit
            };
          })
        : []
    };
  }
}
