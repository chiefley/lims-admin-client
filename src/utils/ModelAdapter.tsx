import React from 'react';
import { SopMaintenanceSelectors } from '../models/types';

/**
 * Utility functions to help with model-to-view conversions
 */
export const ModelAdapter = {
  /**
   * Finds the label for a selector item by ID
   * @param items The selector items array
   * @param id The ID to look up
   * @returns The corresponding label or a fallback string
   */
  findLabel: (items: { id: number | null; label: string }[], id: number | null): string => {
    // Handle various scenarios that might cause the lookup to fail
    if (id === null || id === undefined) {
      return 'Not Selected';
    }

    // Try to find the matching item, converting both to numbers to ensure type safety
    const matchingItem = items.find(item => item.id !== null && Number(item.id) === Number(id));

    return matchingItem ? matchingItem.label : `ID: ${id}`;
  },

  /**
   * Gets the panel group label for a given ID
   * @param selectors The full selectors object
   * @param panelGroupId The panel group ID
   * @returns The label or fallback
   */
  getPanelGroupLabel: (selectors: SopMaintenanceSelectors, panelGroupId: number | null): string => {
    return ModelAdapter.findLabel(selectors.panelGroupItems, panelGroupId);
  },

  /**
   * Gets the sample type label for a given ID
   * @param selectors The full selectors object
   * @param sampleTypeId The sample type ID
   * @returns The label or fallback
   */
  getSampleTypeLabel: (selectors: SopMaintenanceSelectors, sampleTypeId: number | null): string => {
    return ModelAdapter.findLabel(selectors.manifestSampleTypeItems, sampleTypeId);
  },
};

export default ModelAdapter;
