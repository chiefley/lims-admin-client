// src/api/endpoints/index.ts

// Export all service functions from the configuration service
export * from './configurationService';

// Export all service functions from the instrument service - these are now merged into configurationService
// but we keep this for backward compatibility
export * from './instrumentService';

// Export the default objects for more convenient imports
export { default as configurationService } from './configurationService';
export { default as instrumentService } from './instrumentService';
