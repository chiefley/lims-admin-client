// src/config/appConfig.ts

const appConfig = {
  // API Configuration
  api: {
    baseUrl: 'http://localhost:50511/api',
    endpoints: {
      sopMaintenance: {
        base: '/sopmaintenance',
        fetchSelectors: '/FetchSelectors',
        fetchBatchSopSelections: '/FetchBatchSopSelections',
      },
    },
    defaultLabId: 1001,
  },

  // Feature flags
  features: {
    useMockData: true, // Set to false when real API is available
  },
};

export default appConfig;
