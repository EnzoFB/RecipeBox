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
          `INSERT INTO ingredients (name, category, unitId, image, calories, protein, carbs, fat)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ingredient.name,
            ingredient.category || 'Autre',
            ingredient.unitId || null,
            ingredient.image || null,
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
      
      // Construire dynamiquement la requête UPDATE en fonction des champs fournis
      const updates: string[] = [];
      const params: any[] = [];

      if ('name' in ingredient) {
        updates.push('name = ?');
        params.push(ingredient.name || null);
      }
      if ('category' in ingredient) {
        updates.push('category = ?');
        params.push(ingredient.category || 'Autre');
      }
      if ('unitId' in ingredient) {
        updates.push('unitId = ?');
        params.push(ingredient.unitId || null);
      }
      if ('image' in ingredient) {
        updates.push('image = ?');
        params.push(ingredient.image || null); // Allow null to clear image
      }
      if ('calories' in ingredient) {
        updates.push('calories = ?');
        params.push(ingredient.calories || null);
      }
      if ('protein' in ingredient) {
        updates.push('protein = ?');
        params.push(ingredient.protein || null);
      }
      if ('carbs' in ingredient) {
        updates.push('carbs = ?');
        params.push(ingredient.carbs || null);
      }
      if ('fat' in ingredient) {
        updates.push('fat = ?');
        params.push(ingredient.fat || null);
      }

      // Always update timestamp
      updates.push('updatedAt = CURRENT_TIMESTAMP');
      params.push(id);

      const sql = `UPDATE ingredients SET ${updates.join(', ')} WHERE id = ?`;

      await runAsync(sql, params);
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
