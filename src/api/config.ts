// src/api/config.ts
import client from './client';
import appConfig from '../config/appConfig';

// Base URL from your API documentation
export const BASE_URL = appConfig.api.baseUrl;

// Default LabId from your documentation
export const DEFAULT_LAB_ID = appConfig.api.defaultLabId;

// Export the client
export const apiClient = client;
