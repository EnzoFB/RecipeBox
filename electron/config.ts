/**
 * Electron Configuration
 */

import * as path from 'node:path';

export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  icon?: string;
}

export interface AppConfig {
  isDevelopment: boolean;
  devServerUrl: string;
  productionUrl: (buildPath: string) => string;
  window: WindowConfig;
  preload: string;
}

export const getAppConfig = (): AppConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    isDevelopment,
    devServerUrl: 'http://localhost:4200',
    productionUrl: (buildPath: string) => `file://${path.join(buildPath, 'browser', 'index.html')}`,
    window: {
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
    },
    preload: path.join(__dirname, 'preload.js'),
  };
};
