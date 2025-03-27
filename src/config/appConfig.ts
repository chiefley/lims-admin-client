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
    useMockData: false, // Set to false to use the real API
    useMockDataAsFallback: true, // Use mock data if API calls fail
  },
};

export default appConfig;
