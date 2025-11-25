import { contextBridge, ipcRenderer } from 'electron';

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
  },
});
