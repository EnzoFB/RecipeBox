import { app, BrowserWindow } from 'electron';
import * as path from 'node:path';
import { initializeDatabase, closeDatabase } from './db';
import { registerAllHandlers } from './ipc/handlers';
import { getAppConfig } from './config';
import { Logger } from './logger';

const logger = new Logger('Main');
let mainWindow: BrowserWindow | null;

// ============================================================================
// Window Management
// ============================================================================

const createWindow = (): void => {
  const config = getAppConfig();
  
  mainWindow = new BrowserWindow({
    width: config.window.width,
    height: config.window.height,
    minWidth: config.window.minWidth,
    minHeight: config.window.minHeight,
    webPreferences: {
      preload: config.preload,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = config.isDevelopment
    ? config.devServerUrl
    : config.productionUrl(path.dirname(__dirname));

  logger.info(`Loading URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  if (config.isDevelopment) {
    mainWindow.webContents.openDevTools();
    logger.info('Dev Tools opened');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    logger.info('Main window closed');
  });

  logger.success('Window created');
};

// ============================================================================
// App Event Handlers
// ============================================================================

app.on('ready', async () => {
  try {
    logger.info('App starting...');
    await initializeDatabase();
    logger.success('Database initialized');
    
    registerAllHandlers();
    logger.success('IPC handlers registered');
    
    createWindow();
  } catch (error) {
    logger.error('Failed to initialize app', error);
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  logger.info('All windows closed');
  await closeDatabase();
  logger.success('Database connection closed');
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    logger.info('App activated, creating window');
    createWindow();
  }
});

// ============================================================================
// Error Handling
// ============================================================================

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
});

