import { contextBridge, ipcRenderer } from 'electron';

// ============================================================================
// Expose IPC Methods to Renderer
// ============================================================================

contextBridge.exposeInMainWorld('electronAPI', {
  // Recipe APIs
  recipes: {
    getAll: () => ipcRenderer.invoke('recipes:getAll'),
    getById: (id: number) => ipcRenderer.invoke('recipes:getById', id),
    add: (recipe: any) => ipcRenderer.invoke('recipes:add', recipe),
    update: (id: number, recipe: any) => ipcRenderer.invoke('recipes:update', id, recipe),
    delete: (id: number) => ipcRenderer.invoke('recipes:delete', id),
  },
  // Ingredient APIs
  ingredients: {
    getAll: () => ipcRenderer.invoke('ingredients:getAll'),
    add: (ingredient: any) => ipcRenderer.invoke('ingredients:add', ingredient),
    update: (id: number, ingredient: any) => ipcRenderer.invoke('ingredients:update', id, ingredient),
    delete: (id: number) => ipcRenderer.invoke('ingredients:delete', id),
    getById: (id: number) => ipcRenderer.invoke('ingredients:getById', id),
  },
  // Stock APIs
  stock: {
    getAll: () => ipcRenderer.invoke('stock:getAll'),
    add: (stock: any) => ipcRenderer.invoke('stock:add', stock),
    update: (id: number, stock: any) => ipcRenderer.invoke('stock:update', id, stock),
    delete: (id: number) => ipcRenderer.invoke('stock:delete', id),
    getExpiring: () => ipcRenderer.invoke('stock:getExpiring'),
  },
  // Shopping List APIs
  shoppingList: {
    getAll: () => ipcRenderer.invoke('shoppingList:getAll'),
    getWithDetails: () => ipcRenderer.invoke('shoppingList:getWithDetails'),
    add: (item: any) => ipcRenderer.invoke('shoppingList:add', item),
    addBulk: (items: any[]) => ipcRenderer.invoke('shoppingList:addBulk', items),
    update: (id: number, item: any) => ipcRenderer.invoke('shoppingList:update', id, item),
    delete: (id: number) => ipcRenderer.invoke('shoppingList:delete', id),
    deleteByIngredient: (ingredientId: number) => ipcRenderer.invoke('shoppingList:deleteByIngredient', ingredientId),
    deleteByRecipe: (recipeId: number) => ipcRenderer.invoke('shoppingList:deleteByRecipe', recipeId),
    clear: () => ipcRenderer.invoke('shoppingList:clear'),
  },
});
