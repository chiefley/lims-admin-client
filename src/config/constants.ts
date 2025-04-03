// src/config/constants.ts

// API configuration
export const API_TIMEOUT = 15000; // 15 seconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Date format constants
export const DATE_FORMAT = 'MM/DD/YYYY';
export const DATE_TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
};

// Feature flags
export const FEATURES = {
  ENABLE_MOCK_DATA: false,
  ENABLE_MOCK_DATA_FALLBACK: true,
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
};
