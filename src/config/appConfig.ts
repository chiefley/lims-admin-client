// src/config/appConfig.ts

const appConfig = {
  // API Configuration
  api: {
    baseUrl: 'http://localhost:50511/api',
    endpoints: {
      configurationMaintenance: {
        base: '/configurationmaintenance',
        fetchSelectors: '/FetchSelectors',
        fetchBatchSopSelections: '/FetchBatchSopSelections',
        fetchAnalyticalBatchSopSelections: '/FetchAnalyticalBatchSopSelections',
        fetchPrepBatchSopRs: '/FetchPrepBatchSopRs',
        fetchAnalyticalBatchSopRs: '/FetchAnalyticalBatchSopRs',
        fetchCompoundRss: '/FetchCompoundRss',
        fetchPanelRss: '/FetchPanelRss',
        fetchInstrumentTypeRss: '/FetchInstrumentTypeRss',
      },
    },
    defaultLabId: 1001,
  },

  // Feature flags
  features: {
    useMockData: false, // Set to true to skip API calls entirely and use mock data
    useMockDataAsFallback: true, // Use mock data if API calls fail
  },
};

export default appConfig;
