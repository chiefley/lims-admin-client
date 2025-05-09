// src/models/types/index.ts
// Main barrel file that re-exports all type definitions

// Common types
export * from '../../features/shared/types/common';

// Domain-specific types

export * from '../../features/shared/types/batchSops';
export * from './prepBatchSops';
export * from './analyticalBatchSops';

// This file replaces the original types.ts
// Now consumers can continue using:
// import { SomeType } from '../models/types';
// Without changing their import statements
