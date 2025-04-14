# Active/Inactive Management Pattern in LIMS Admin Client

## Overview

The LIMS Admin Client implements a consistent pattern for handling active and inactive records across the application. Rather than permanently deleting records that may be referenced by other parts of the system, the application follows a soft-deletion approach using an "Active" flag. This document outlines the implementation details and best practices for this pattern.

Note: The Delete pattern should be followed on all pages unless otherwise noted. The Active/Inactive pattern should be followed on all pages that manage responses that have the Active property.

## Key Concepts

### 1. Active Flag

- All major entity types include an optional `active` property (boolean)
- Records with `active=true` or where the property is undefined are considered active
- Records with `active=false` are considered inactive and hidden by default

### 2. Visibility Control

- Each management page includes a "Show Inactive" checkbox
- By default, only active records are displayed
- When "Show Inactive" is checked, both active and inactive records are shown
- Inactive records are visually distinguished with styling and tags

### 3. Deletion Rules

- Only newly created records with temporary IDs (negative values) can be truly deleted
- Existing records that have been persisted to the database can only be marked as inactive
- This preserves referential integrity while allowing "logical" deletion

## Implementation Details

### UI Components

1. **Show Inactive Checkbox**

   - Consistently placed at the top of management pages or table sections
   - Controls visibility across the entire hierarchy of data (parent and child records)
   - State is maintained at the top-level component and passed down to children

2. **Visual Indicators**

   - Inactive rows have reduced opacity and different background color
   - "Inactive" tags are displayed next to the record name
   - Tooltips or messages indicate when inactive records are hidden

3. **Filtering Logic**
   ```typescript
   // Filter records based on active status
   const filteredRecords = showInactive
     ? records
     : records.filter(record => record.active !== false);
   ```

### Model Structure

All entity interfaces should include the optional active property:

```typescript
export interface EntityType {
  id: number;
  name: string;
  // Other properties...
  active?: boolean; // Optional to handle legacy data
}
```

### CRUD Operations

1. **Create**

   - New records are assigned `active=true` by default
   - New records use temporary negative IDs until saved

2. **Read**

   - Filtering logic shows/hides inactive records based on user preference
   - Consistent hierarchy filtering (parent and children)

3. **Update**

   - The `active` property can be toggled via a switch in edit forms
   - When saving, ensure the active property is correctly converted to boolean

4. **Delete**
   - Only allow true deletion for records with negative IDs (unsaved)
   - For persisted records, set `active=false` instead of deletion

## Best Practices

1. **Consistent UI Placement**

   - Place the "Show Inactive" control at a consistent location
   - Use in table headers, card headers, or tab section headers

2. **Clear Visual Distinction**

   - Use consistent styling for inactive items
   - Include status tags and reduced opacity

3. **Helpful Messaging**

   - Show meaningful messages when filtered lists are empty
   - Indicate when inactive records exist but are hidden

4. **Transitive Filtering**

   - When filtering parent records, apply the same filter to their children
   - Maintain consistent visibility rules across the entire object graph

5. **TypeScript Integration**
   - Define the `active` property in all relevant interfaces
   - Use optional typing (`active?`) to handle legacy data

## Example Code

```typescript
// Parent component state
const [showInactive, setShowInactive] = useState<boolean>(false);

// Filter records in useEffect or useMemo
useEffect(() => {
  let filtered = [...allRecords];

  // Filter by active status if not showing inactive items
  if (!showInactive) {
    filtered = filtered.filter(record => record.active !== false);
  }

  // Apply other filters (search, etc.)
  if (searchText) {
    filtered = filtered.filter(record =>
      record.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  setFilteredRecords(filtered);
}, [allRecords, showInactive, searchText]);
```

By following these patterns consistently across the application, we ensure a predictable and user-friendly experience for managing active and inactive records while maintaining data integrity.
