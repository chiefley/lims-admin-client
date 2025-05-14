// src/api/endpoints/index.ts

import clientService from '../../features/clients/clientService';
// Export all service functions from the configuration service
export * from './configurationService';

// Export the default objects for more convenient imports
export { default as configurationService } from './configurationService';
export { clientService };
