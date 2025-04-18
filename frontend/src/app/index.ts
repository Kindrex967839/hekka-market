/**
 * HEKKA MARKET App API
 *
 * This file exports a stable API for the application.
 *
 * Usage examples:
 *
 * // API endpoints can be called via the API client
 * import { api } from "app";
 * const response = await api.checkHealth();
 *
 * // API websocket endpoints are reachable at `${WS_API_URL}/endpointname`
 * import { WS_API_URL } from "app";
 * const socket = new WebSocket(`${WS_API_URL}/endpointname`)
 *
 * // Constants are also available
 * import { APP_TITLE } from "app";
 */

// Export constants
export {
  API_URL,
  APP_BASE_PATH,
  APP_ID,
  APP_TITLE,
  Mode,
  WS_API_URL,
  mode,
} from "../utils/appConstants";

// Export auth utilities
export * from "./auth";

// Export API client
import apiClient from "../utils/apiClient";
export const api = apiClient;
