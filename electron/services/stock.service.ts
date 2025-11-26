/**
 * Stock Service - Handles all ingredient stock-related database operations
 */

import { Logger } from '../logger';
import { IngredientStock } from '../types';
import { allAsync, runAsync, getDatabase } from '../db';

const logger = new Logger('StockService');

export class StockService {
  async getAll(): Promise<IngredientStock[]> {
    try {
      logger.debug('Fetching all stock items');
      
      const stock = await allAsync<IngredientStock>(`
        SELECT s.*, i.name, i.category
        FROM ingredient_stock s
        JOIN ingredients i ON s.ingredientId = i.id
        ORDER BY s.expiryDate ASC
      `);
      
      logger.debug(`Fetched ${stock.length} stock items`);
      return stock;
    } catch (error) {
      logger.error('Failed to fetch stock', error);
      throw error;
    }
  }

  async add(stock: Omit<IngredientStock, 'id'>): Promise<number> {
    try {
      logger.debug('Adding new stock item', { ingredientId: stock.ingredientId });
      
      const result = await new Promise<{ id: number }>((resolve, reject) => {
        const db = getDatabase();
        if (!db) {
          reject(new Error('Database not initialized'));
          return;
        }

        db.run(
          `INSERT INTO ingredient_stock (ingredientId, quantity, unit, expiryDate)
           VALUES (?, ?, ?, ?)`,
          [
            stock.ingredientId,
            stock.quantity,
            stock.unit,
            stock.expiryDate
          ],
          function(this: any, err: any) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      logger.success(`Stock item added with id: ${result.id}`);
      return result.id;
    } catch (error) {
      logger.error('Failed to add stock item', error);
      throw error;
    }
  }

  async update(id: number, stock: Partial<IngredientStock>): Promise<void> {
    try {
      logger.debug(`Updating stock item ${id}`);
      
      await runAsync(
        `UPDATE ingredient_stock 
         SET quantity = COALESCE(?, quantity),
             unit = COALESCE(?, unit),
             expiryDate = COALESCE(?, expiryDate)
         WHERE id = ?`,
        [
          stock.quantity || null,
          stock.unit || null,
          stock.expiryDate || null,
          id
        ]
      );

      logger.success(`Stock item ${id} updated`);
    } catch (error) {
      logger.error(`Failed to update stock item ${id}`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      logger.debug(`Deleting stock item ${id}`);
      
      await runAsync('DELETE FROM ingredient_stock WHERE id = ?', [id]);
      logger.success(`Stock item ${id} deleted`);
    } catch (error) {
      logger.error(`Failed to delete stock item ${id}`, error);
      throw error;
    }
  }

  async getExpiring(daysThreshold = 7): Promise<IngredientStock[]> {
    try {
      logger.debug(`Fetching expiring stock items (${daysThreshold} days threshold)`);
      
      const today = new Date().toISOString().split('T')[0];
      const thresholdDate = new Date(
        Date.now() + daysThreshold * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0];
      
      const expiringStock = await allAsync<IngredientStock>(`
        SELECT s.*, i.name, i.category
        FROM ingredient_stock s
        JOIN ingredients i ON s.ingredientId = i.id
        WHERE s.expiryDate BETWEEN ? AND ?
        ORDER BY s.expiryDate ASC
      `, [today, thresholdDate]);
      
      logger.debug(`Found ${expiringStock.length} expiring items`);
      return expiringStock;
    } catch (error) {
      logger.error('Failed to fetch expiring stock', error);
      throw error;
    }
  }
}
