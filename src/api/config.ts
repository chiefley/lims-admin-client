// src/api/config.ts
import appConfig from '../config/appConfig';

import client from './client';

// Base URL from your API documentation
export const BASE_URL = appConfig.api.baseUrl;

// Default LabId from your documentation
export const DEFAULT_LAB_ID = appConfig.api.defaultLabId;

// Export the client
export const apiClient = client;
