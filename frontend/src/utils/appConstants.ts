/**
 * Application constants
 * This replaces the Databutton-specific constants
 */

// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_API_URL = import.meta.env.VITE_WS_API_URL || 'ws://localhost:8000';

// Application info
export const APP_ID = 'hekka-market';
export const APP_TITLE = 'HEKKA MARKET';
export const APP_BASE_PATH = '/';

// Application mode
export enum Mode {
  DEV = 'development',
  PROD = 'production',
}

export const mode = import.meta.env.MODE === 'production' ? Mode.PROD : Mode.DEV;
