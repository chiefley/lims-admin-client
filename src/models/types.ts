// src/models/types.ts
// This file is now simply a re-export of all types from the types/ folder
// This provides backward compatibility for existing imports

export * from './types/common';
export * from './types/batchSops';
export * from './types/prepBatchSops';
export * from './types/analyticalBatchSops';

// This approach allows us to continue using imports like:
// import { SomeType } from '../models/types';
// While organizing the type definitions into more manageable modules
