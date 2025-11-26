/**
 * Ingredient Service - Handles all ingredient-related database operations
 */

import { Logger } from '../logger';
import { Ingredient } from '../types';
import { allAsync, runAsync, getDatabase } from '../db';

const logger = new Logger('IngredientService');

export class IngredientService {
  async getAll(): Promise<Ingredient[]> {
    try {
      logger.debug('Fetching all ingredients');
      
      const ingredients = await allAsync<Ingredient>(
        'SELECT * FROM ingredients ORDER BY name ASC'
      );
      
      logger.debug(`Fetched ${ingredients.length} ingredients`);
      return ingredients;
    } catch (error) {
      logger.error('Failed to fetch ingredients', error);
      throw error;
    }
  }

  async add(ingredient: Omit<Ingredient, 'id'>): Promise<number> {
    try {
      logger.debug('Adding new ingredient', { name: ingredient.name });
      
      const result = await new Promise<{ id: number }>((resolve, reject) => {
        const db = getDatabase();
        if (!db) {
          reject(new Error('Database not initialized'));
          return;
        }

        db.run(
          `INSERT INTO ingredients (name, category, unitId, calories, protein, carbs, fat)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            ingredient.name,
            ingredient.category || 'Autre',
            ingredient.unitId || null,
            ingredient.calories || null,
            ingredient.protein || null,
            ingredient.carbs || null,
            ingredient.fat || null
          ],
          function(this: any, err: any) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      logger.success(`Ingredient added with id: ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Failed to add ingredient', error);
      throw error;
    }
  }

  async update(id: number, ingredient: Partial<Ingredient>): Promise<void> {
    try {
      logger.debug(`Updating ingredient ${id}`);
      
      await runAsync(
        `UPDATE ingredients 
         SET name = COALESCE(?, name),
             category = COALESCE(?, category),
             unitId = COALESCE(?, unitId),
             calories = COALESCE(?, calories),
             protein = COALESCE(?, protein),
             carbs = COALESCE(?, carbs),
             fat = COALESCE(?, fat),
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          ingredient.name || null,
          ingredient.category || null,
          ingredient.unitId || null,
          ingredient.calories || null,
          ingredient.protein || null,
          ingredient.carbs || null,
          ingredient.fat || null,
          id
        ]
      );

      logger.success(`Ingredient ${id} updated`);
    } catch (error) {
      logger.error(`Failed to update ingredient ${id}`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      logger.debug(`Deleting ingredient ${id}`);
      
      await runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
      logger.success(`Ingredient ${id} deleted`);
    } catch (error) {
      logger.error(`Failed to delete ingredient ${id}`, error);
      throw error;
    }
  }
}
