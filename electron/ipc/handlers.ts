/**
 * IPC Handlers Registry - Centralizes all IPC event listeners
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Logger } from '../logger';
import { RecipeService, IngredientService, StockService } from '../services';

const logger = new Logger('IPCHandlers');

const recipeService = new RecipeService();
const ingredientService = new IngredientService();
const stockService = new StockService();

// ============================================================================
// Error Handler Wrapper
// ============================================================================

function handleIpcError(channel: string, error: any, reject?: (reason?: any) => void): void {
  logger.error(`IPC Error on channel '${channel}'`, error);
  if (reject) {
    reject(error);
  }
}

// ============================================================================
// Recipe Handlers
// ============================================================================

export function registerRecipeHandlers(): void {
  ipcMain.handle('recipes:getAll', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: recipes:getAll');
      return await recipeService.getAll();
    } catch (error) {
      handleIpcError('recipes:getAll', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:getById', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      logger.debug(`IPC: recipes:getById (${id})`);
      return await recipeService.getById(id);
    } catch (error) {
      handleIpcError('recipes:getById', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:add', async (_event: IpcMainInvokeEvent, recipe: any) => {
    try {
      logger.debug('IPC: recipes:add');
      return await recipeService.add(recipe);
    } catch (error) {
      handleIpcError('recipes:add', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:update', async (_event: IpcMainInvokeEvent, id: number, recipe: any) => {
    try {
      logger.debug(`IPC: recipes:update (${id})`);
      return await recipeService.update(id, recipe);
    } catch (error) {
      handleIpcError('recipes:update', error);
      throw error;
    }
  });

  ipcMain.handle('recipes:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      logger.debug(`IPC: recipes:delete (${id})`);
      return await recipeService.delete(id);
    } catch (error) {
      handleIpcError('recipes:delete', error);
      throw error;
    }
  });

  logger.info('✓ Recipe IPC handlers registered');
}

// ============================================================================
// Ingredient Handlers
// ============================================================================

export function registerIngredientHandlers(): void {
  ipcMain.handle('ingredients:getAll', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: ingredients:getAll');
      return await ingredientService.getAll();
    } catch (error) {
      handleIpcError('ingredients:getAll', error);
      throw error;
    }
  });

  ipcMain.handle('ingredients:add', async (_event: IpcMainInvokeEvent, ingredient: any) => {
    try {
      logger.debug('IPC: ingredients:add');
      return await ingredientService.add(ingredient);
    } catch (error) {
      handleIpcError('ingredients:add', error);
      throw error;
    }
  });

  ipcMain.handle('ingredients:update', async (_event: IpcMainInvokeEvent, id: number, ingredient: any) => {
    try {
      logger.debug(`IPC: ingredients:update (${id})`);
      return await ingredientService.update(id, ingredient);
    } catch (error) {
      handleIpcError('ingredients:update', error);
      throw error;
    }
  });

  ipcMain.handle('ingredients:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      logger.debug(`IPC: ingredients:delete (${id})`);
      return await ingredientService.delete(id);
    } catch (error) {
      handleIpcError('ingredients:delete', error);
      throw error;
    }
  });

  logger.info('✓ Ingredient IPC handlers registered');
}

// ============================================================================
// Stock Handlers
// ============================================================================

export function registerStockHandlers(): void {
  ipcMain.handle('stock:getAll', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: stock:getAll');
      return await stockService.getAll();
    } catch (error) {
      handleIpcError('stock:getAll', error);
      throw error;
    }
  });

  ipcMain.handle('stock:add', async (_event: IpcMainInvokeEvent, stock: any) => {
    try {
      logger.debug('IPC: stock:add');
      return await stockService.add(stock);
    } catch (error) {
      handleIpcError('stock:add', error);
      throw error;
    }
  });

  ipcMain.handle('stock:update', async (_event: IpcMainInvokeEvent, id: number, stock: any) => {
    try {
      logger.debug(`IPC: stock:update (${id})`);
      return await stockService.update(id, stock);
    } catch (error) {
      handleIpcError('stock:update', error);
      throw error;
    }
  });

  ipcMain.handle('stock:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      logger.debug(`IPC: stock:delete (${id})`);
      return await stockService.delete(id);
    } catch (error) {
      handleIpcError('stock:delete', error);
      throw error;
    }
  });

  ipcMain.handle('stock:getExpiring', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: stock:getExpiring');
      return await stockService.getExpiring();
    } catch (error) {
      handleIpcError('stock:getExpiring', error);
      throw error;
    }
  });

  logger.info('✓ Stock IPC handlers registered');
}

// ============================================================================
// Register All Handlers
// ============================================================================

export function registerAllHandlers(): void {
  registerRecipeHandlers();
  registerIngredientHandlers();
  registerStockHandlers();
  logger.success('All IPC handlers registered');
}
