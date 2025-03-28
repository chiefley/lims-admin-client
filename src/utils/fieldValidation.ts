/**
 * Utility functions for field validation in forms and editable tables
 */

/**
 * Common validation rules that can be reused across the application
 */
export const validationRules = {
  /**
   * Required field validation
   * @param message Custom message to display
   */
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),

  /**
   * Maximum length validation
   * @param max Maximum length
   * @param message Custom message to display
   */
  maxLength: (max: number, message?: string) => ({
    max,
    message: message || `Cannot exceed ${max} characters`,
  }),

  /**
   * Minimum length validation
   * @param min Minimum length
   * @param message Custom message to display
   */
  minLength: (min: number, message?: string) => ({
    min,
    message: message || `Must be at least ${min} characters`,
  }),

  /**
   * Email format validation
   * @param message Custom message to display
   */
  email: (message = 'Please enter a valid email address') => ({
    type: 'email',
    message,
  }),

  /**
   * Pattern validation
   * @param pattern RegExp pattern to match
   * @param message Custom message to display
   */
  pattern: (pattern: RegExp, message: string) => ({
    pattern,
    message,
  }),
};

/**
 * Checks if a combination of fields is unique in a dataset
 * @param fieldNames Array of field names to check for uniqueness
 * @param dataset Dataset to check against
 * @param excludeId ID field to exclude from the check (usually the record being edited)
 * @param idField Name of the ID field
 * @param message Custom message to display
 */
export const isUniqueCombination = (
  fieldNames: string[],
  dataset: any[],
  excludeId: any,
  idField: string,
  message = 'This combination already exists'
) => {
  return (rule: any, value: any, callback: (error?: string) => void, source: any) => {
    const hasDuplicate = dataset.some(item => {
      // Skip the current record
      if (item[idField] === excludeId) {
        return false;
      }

      // Check if all fields match
      return fieldNames.every(field => {
        const sourceValue = field === rule.field ? value : source[field];
        return item[field] === sourceValue;
      });
    });

    if (hasDuplicate) {
      callback(message);
    } else {
      callback();
    }
  };
};

/**
 * Helper to create a validator function for unique field validation
 * @param fieldName Field to check for uniqueness
 * @param dataset Dataset to check against
 * @param excludeId ID to exclude (usually the record being edited)
 * @param idField Name of the ID field
 * @param message Custom message to display
 */
export const isUniqueField = (
  fieldName: string,
  dataset: any[],
  excludeId: any,
  idField: string,
  message = 'This value must be unique'
) => {
  return (rule: any, value: any, callback: (error?: string) => void) => {
    if (!value) {
      callback();
      return;
    }

    const hasDuplicate = dataset.some(
      item => item[idField] !== excludeId && item[fieldName] === value
    );

    if (hasDuplicate) {
      callback(message);
    } else {
      callback();
    }
  };
};

export default {
  validationRules,
  isUniqueCombination,
  isUniqueField,
};
