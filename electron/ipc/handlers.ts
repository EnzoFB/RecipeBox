/**
 * IPC Handlers Registry - Centralizes all IPC event listeners
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Logger } from '../logger';
import { RecipeService, IngredientService, StockService, ShoppingListService } from '../services';

const logger = new Logger('IPCHandlers');

const recipeService = new RecipeService();
const ingredientService = new IngredientService();
const stockService = new StockService();
const shoppingListService = new ShoppingListService();

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
// Shopping List Handlers
// ============================================================================

export function registerShoppingListHandlers(): void {
  ipcMain.handle('shoppingList:getAll', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: shoppingList:getAll');
      return await shoppingListService.getAll();
    } catch (error) {
      handleIpcError('shoppingList:getAll', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:getWithDetails', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: shoppingList:getWithDetails');
      return await shoppingListService.getWithIngredientDetails();
    } catch (error) {
      handleIpcError('shoppingList:getWithDetails', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:add', async (_event: IpcMainInvokeEvent, item: any) => {
    try {
      logger.debug('IPC: shoppingList:add');
      return await shoppingListService.add(item);
    } catch (error) {
      handleIpcError('shoppingList:add', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:addBulk', async (_event: IpcMainInvokeEvent, items: any[]) => {
    try {
      logger.debug('IPC: shoppingList:addBulk');
      return await shoppingListService.addBulk(items);
    } catch (error) {
      handleIpcError('shoppingList:addBulk', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:update', async (_event: IpcMainInvokeEvent, id: number, item: any) => {
    try {
      logger.debug(`IPC: shoppingList:update (${id})`);
      return await shoppingListService.update(id, item);
    } catch (error) {
      handleIpcError('shoppingList:update', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      logger.debug(`IPC: shoppingList:delete (${id})`);
      return await shoppingListService.delete(id);
    } catch (error) {
      handleIpcError('shoppingList:delete', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:deleteByIngredient', async (_event: IpcMainInvokeEvent, ingredientId: number) => {
    try {
      logger.debug(`IPC: shoppingList:deleteByIngredient (${ingredientId})`);
      return await shoppingListService.deleteByIngredient(ingredientId);
    } catch (error) {
      handleIpcError('shoppingList:deleteByIngredient', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:deleteByRecipe', async (_event: IpcMainInvokeEvent, recipeId: number) => {
    try {
      logger.debug(`IPC: shoppingList:deleteByRecipe (${recipeId})`);
      return await shoppingListService.deleteByRecipe(recipeId);
    } catch (error) {
      handleIpcError('shoppingList:deleteByRecipe', error);
      throw error;
    }
  });

  ipcMain.handle('shoppingList:clear', async (_event: IpcMainInvokeEvent) => {
    try {
      logger.debug('IPC: shoppingList:clear');
      return await shoppingListService.clear();
    } catch (error) {
      handleIpcError('shoppingList:clear', error);
      throw error;
    }
  });

  logger.info('✓ Shopping List IPC handlers registered');
}

// ============================================================================
// Register All Handlers
// ============================================================================

export function registerAllHandlers(): void {
  registerRecipeHandlers();
  registerIngredientHandlers();
  registerStockHandlers();
  registerShoppingListHandlers();
  logger.success('All IPC handlers registered');
}
