# LIMS Admin Client Design Approach

## Overview

This document outlines the design principles and data management approach for the LIMS Admin Client application, explaining the rationale behind the architectural decisions and providing guidance for future development.

## Target Users and Usage Pattern

The LIMS Admin Client is designed for:

- A small number of in-house laboratory scientists and technicians
- Users who are domain experts but not necessarily technical UI experts
- Infrequent but mission-critical administrative operations

## Design Philosophy

The application follows these core principles:

1. **Information Density**: Present comprehensive information in a structured format appropriate for expert users
2. **Simplicity over Performance**: Optimize for clarity and reliability rather than maximum performance
3. **Complete Data Graphs**: Work with entire object graphs rather than individual entities
4. **Centralized Logic**: Keep business logic on the server where possible

## Data Management Approach

### Client-Server Communication

The application uses a simplified API approach:

- **One GET endpoint per major entity type** - Retrieves the complete object graph for a subject area
- **One PUT endpoint per major entity type** - Submits the entire object graph with all changes

This approach has several advantages:

- Reduces API complexity
- Ensures data consistency through atomic updates
- Minimizes the need for complex state management on the client
- Leverages Entity Framework's change tracking capabilities

### Handling Data Modifications

The client application manages data modifications following this pattern:

1. Load the complete data structure from the server
2. Allow users to modify the data structure in memory (add, edit, delete)
3. Assign temporary negative IDs to new records for identification
4. On submission, send the entire structure back to the server
5. Server processes the structure to determine what to create, update, or delete:
   - Records with IDs <= 0 are treated as new and inserted
   - Records with positive IDs that exist in the database are updated
   - Records in the database that aren't in the submitted data are deleted (if applicable)

### Example: Instrument Management

For an entity like InstrumentType with child Instruments:

1. User adds a new InstrumentType → client assigns a temporary negative ID
2. User adds Instruments to the new InstrumentType → each gets a temporary negative ID
3. On submission, the server:
   - Creates the new InstrumentType, generating a real ID
   - Creates the new Instruments with reference to the new InstrumentType ID
   - Returns the complete updated structure with real IDs

## UI Component Strategy

The UI is organized around:

1. **List/Management Pages** - Display all entities of a type with basic information
2. **Detail Pages** - Show and edit the complete object graph for a single entity
3. **Tab-based Organization** - Group related data on detail pages
4. **Editable Tables** - Allow inline editing of tabular data
5. **Modal Forms** - For adding new items or detailed editing

## Tech Stack

- **React** with TypeScript for type safety
- **Ant Design** for UI components
- **Axios** for API communication
- **React Router** for navigation

## Error Handling and Validation

1. **Client-side Validation** - Immediate feedback for basic validation rules
2. **Server-side Validation** - Comprehensive validation with business logic
3. **Error Messages** - Displayed to users with actionable information

## Future Considerations

When extending this application, maintain these principles:

1. Continue working with complete object graphs where appropriate
2. Keep the API surface simple with paired GET/PUT endpoints
3. Leverage server-side validation and business logic
4. Consider the expertise of the user base when designing UI density
5. Prioritize clarity over performance optimization for this admin tool

This approach ensures the LIMS Admin Client remains maintainable, reliable, and appropriate for its specialized use case.
