/**
 * Shopping List Service - Handles shopping list database operations
 */

import { Logger } from '../logger';
import { allAsync, runAsync, getDatabase } from '../db';

const logger = new Logger('ShoppingListService');

interface ShoppingListItem {
  id?: number;
  ingredientId: number;
  quantityNeeded: number;
  unit: string;
  sourceRecipeId?: number;
  sourceRecipeName?: string;
  createdAt?: string;
}

export class ShoppingListService {
  async getAll(): Promise<ShoppingListItem[]> {
    try {
      logger.debug('Fetching all shopping list items');
      
      const items = await allAsync<ShoppingListItem>(`
        SELECT * FROM shopping_list
        ORDER BY createdAt DESC
      `);
      
      return items;
    } catch (error) {
      logger.error('Failed to fetch shopping list', error);
      throw error;
    }
  }

  async getWithIngredientDetails(): Promise<any[]> {
    try {
      logger.debug('Fetching shopping list with ingredient details');
      
      const items = await allAsync<any>(`
        SELECT 
          sl.*,
          i.name as ingredientName,
          i.category as ingredientCategory
        FROM shopping_list sl
        JOIN ingredients i ON sl.ingredientId = i.id
        ORDER BY sl.createdAt DESC
      `);
      
      return items;
    } catch (error) {
      logger.error('Failed to fetch shopping list with details', error);
      throw error;
    }
  }

  async add(item: Omit<ShoppingListItem, 'id' | 'createdAt'>): Promise<number> {
    try {
      logger.debug('Adding item to shopping list', { ingredientId: item.ingredientId });
      
      const result = await new Promise<{ id: number }>((resolve, reject) => {
        const db = getDatabase();
        if (!db) {
          reject(new Error('Database not initialized'));
          return;
        }

        db.run(
          `INSERT INTO shopping_list (ingredientId, quantityNeeded, unit, sourceRecipeId, sourceRecipeName)
           VALUES (?, ?, ?, ?, ?)`,
          [
            item.ingredientId,
            item.quantityNeeded,
            item.unit,
            item.sourceRecipeId || null,
            item.sourceRecipeName || null
          ],
          function(this: any, err: any) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      logger.success(`Shopping list item added with id: ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Failed to add shopping list item', error);
      throw error;
    }
  }

  async addBulk(items: Array<Omit<ShoppingListItem, 'id' | 'createdAt'>>): Promise<void> {
    try {
      logger.debug('Adding multiple items to shopping list', { count: items.length });
      
      for (const item of items) {
        await this.add(item);
      }

      logger.success('Bulk shopping list items added');
    } catch (error) {
      logger.error('Failed to add bulk shopping list items', error);
      throw error;
    }
  }

  async update(id: number, item: Partial<ShoppingListItem>): Promise<void> {
    try {
      logger.debug(`Updating shopping list item ${id}`);
      
      await runAsync(
        `UPDATE shopping_list 
         SET quantityNeeded = COALESCE(?, quantityNeeded),
             unit = COALESCE(?, unit),
             sourceRecipeId = COALESCE(?, sourceRecipeId),
             sourceRecipeName = COALESCE(?, sourceRecipeName)
         WHERE id = ?`,
        [
          item.quantityNeeded || null,
          item.unit || null,
          item.sourceRecipeId || null,
          item.sourceRecipeName || null,
          id
        ]
      );

      logger.success(`Shopping list item ${id} updated`);
    } catch (error) {
      logger.error(`Failed to update shopping list item ${id}`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      logger.debug(`Deleting shopping list item ${id}`);
      
      await runAsync('DELETE FROM shopping_list WHERE id = ?', [id]);
      logger.success(`Shopping list item ${id} deleted`);
    } catch (error) {
      logger.error(`Failed to delete shopping list item ${id}`, error);
      throw error;
    }
  }

  async deleteByIngredient(ingredientId: number): Promise<void> {
    try {
      logger.debug(`Deleting shopping list items for ingredient ${ingredientId}`);
      
      await runAsync('DELETE FROM shopping_list WHERE ingredientId = ?', [ingredientId]);
      logger.success(`Shopping list items for ingredient ${ingredientId} deleted`);
    } catch (error) {
      logger.error(`Failed to delete shopping list items for ingredient ${ingredientId}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      logger.debug('Clearing entire shopping list');
      
      await runAsync('DELETE FROM shopping_list');
      logger.success('Shopping list cleared');
    } catch (error) {
      logger.error('Failed to clear shopping list', error);
      throw error;
    }
  }

  async deleteByRecipe(recipeId: number): Promise<void> {
    try {
      logger.debug(`Deleting shopping list items from recipe ${recipeId}`);
      
      await runAsync('DELETE FROM shopping_list WHERE sourceRecipeId = ?', [recipeId]);
      logger.success(`Shopping list items from recipe ${recipeId} deleted`);
    } catch (error) {
      logger.error(`Failed to delete shopping list items from recipe ${recipeId}`, error);
      throw error;
    }
  }
}
