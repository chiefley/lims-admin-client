# API Documentation Strategy for React Client

## Overview

This document outlines our strategy for maintaining API contract documentation for the React client without needing to continuously load the C# backend source files. The approach extracts essential documentation from the C# model classes and incorporates it directly into TypeScript interfaces.

## Challenges

1. **Project Knowledge Capacity Limitations**: Including C# source files in project context consumes significant capacity
2. **Cross-Language Development**: Front-end developers need to understand API contracts without deep C# knowledge
3. **Documentation Synchronization**: Need to maintain alignment between backend models and frontend interfaces

## Solution: Embedded Documentation in TypeScript Interfaces

We'll extract key information from C# model classes and embed it directly in TypeScript interface definitions, including:

1. **Field Validations**: Length constraints, required fields, unique combinations
2. **UI Control Hints**: Dropdown sources, control types, display requirements
3. **Relationship Information**: Parent-child relationships between entities
4. **Business Rules**: Special processing requirements, defaults, and other logic

## Implementation Process

### 1. Extract Documentation from C# Classes

For each C# model class, identify and extract:

- Class-level documentation and comments
- Property-level attributes and comments
- Special validation rules and constraints
- UI control suggestions
- Default values and initialization logic

### 2. Organize TypeScript Interface File

Structure the `types.ts` file to include:

- Namespace organization matching backend structure
- Comprehensive JSDoc comments for each interface
- Embedded field-level documentation
- Type relationships that match the backend object model

### 3. Document API Method Signatures

In a separate file or set of files:

- Document all API endpoints
- Include HTTP method, URL path, and parameters
- Specify return types with proper TypeScript interfaces
- Note any special handling requirements

## Example Implementation

```typescript
/**
 * InstrumentTypeRs
 *
 * Represents an instrument type in the laboratory system.
 *
 * API Endpoints:
 * - GET: /configurationmaintenance/FetchInstrumentTypeRss/{labId}
 * - PUT: /configurationmaintenance/UpsertInstrumentTypeRss/{labId}
 */
export interface InstrumentTypeRs {
  /**
   * Primary key identifier (no display, not editable)
   */
  instrumentTypeId: number;

  /**
   * Name of the instrument type
   * @validation Required, max length 150, must be unique
   * @ui Standard text input
   */
  name: string | null;

  /**
   * Measurement type description
   * @validation Required, max length 150
   */
  measurementType: string;

  /**
   * File system path where instrument data is stored
   * @validation Required, max length 250
   */
  dataFolder: string;

  /**
   * Optional threshold for peak area saturation
   */
  peakAreaSaturationThreshold: number | null;

  /**
   * Type of parser used for instrument data files
   * @validation Required
   * @ui Dropdown control using ConfigurationMaintenanceSelectors.InstrumentFileParserTypes
   */
  instrumentFileParser: InstrumentFileParserType | null;

  /**
   * Whether the instrument type is active
   * @default true (for new records)
   */
  active?: boolean;

  /**
   * Laboratory context
   * @validation Required, must match the current lab
   * @ui Hidden from display/edit
   */
  labId: number;

  /**
   * Child instruments belonging to this type
   * @relationship Child collection, parent reference is instrumentTypeId
   */
  instrumentRss: InstrumentRs[];

  /**
   * Analytes associated with this instrument type
   * @relationship Child collection, composite key with instrumentTypeId
   * @note This is an exception to the standard pattern - hard deletable, no Active flag
   */
  instrumentTypeAnalyteRss: InstrumentTypeAnalyteRs[];
}
```

## Benefits

1. **Single Source of Truth**: TypeScript interfaces become the definitive reference for API contracts
2. **Reduced Context Size**: No need to keep loading C# files into the project context
3. **Better Developer Experience**: Front-end developers can reference all API information in TypeScript
4. **Type Safety**: Maintain strong typing throughout the React application

## Maintenance Considerations

1. **Synchronization**: When backend models change, update the TypeScript interfaces accordingly
2. **Documentation Style**: Use consistent JSDoc formatting for better IDE integration
3. **Interface Organization**: Group related interfaces to match backend domain organization
4. **Versioning**: Consider documenting API version information where applicable

This strategy provides a sustainable approach to maintaining API documentation without continuously loading C# source files into the project context.
