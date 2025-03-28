import { useState } from 'react';
import { Form, FormInstance } from 'antd';
import { message } from 'antd';

interface UseEditableTableOptions<T> {
  onSave?: (record: T) => Promise<any> | void;
  onValidationFail?: (error: any) => void;
  idField?: string;
}

/**
 * Custom hook to manage editable table state and operations
 * @param options Configuration options
 * @returns Object with state values and handler functions
 */
export function useEditableTable<T extends Record<string, any>>(
  options: UseEditableTableOptions<T> = {}
) {
  const { onSave, onValidationFail, idField = 'id' } = options;

  // Create form instance
  const [form] = Form.useForm();
  // Track which row is being edited
  const [editingKey, setEditingKey] = useState<string | number>('');
  // Track if currently saving
  const [saving, setSaving] = useState(false);

  /**
   * Check if a record is currently being edited
   * @param record The record to check
   * @returns Boolean indicating if the record is in edit mode
   */
  const isEditing = (record: T): boolean => {
    return record[idField]?.toString() === editingKey.toString();
  };

  /**
   * Start editing a record
   * @param record The record to edit
   */
  const edit = (record: T): void => {
    // Set form values from record
    form.setFieldsValue({ ...record });
    // Set editing key
    setEditingKey(record[idField]);
  };

  /**
   * Cancel editing and reset form
   */
  const cancel = (): void => {
    setEditingKey('');
    form.resetFields();
  };

  /**
   * Save the edited record
   * @param record The original record before editing
   */
  const save = async (record: T): Promise<void> => {
    try {
      setSaving(true);

      // Validate fields
      const row = await form.validateFields();

      // Merge original record with form values
      const updatedRecord = {
        ...record,
        ...row,
      };

      // Call onSave callback if provided
      if (onSave) {
        await onSave(updatedRecord);
      }

      // Reset editing state
      setEditingKey('');

      message.success('Saved successfully');
    } catch (error) {
      // Call onValidationFail if provided
      if (onValidationFail) {
        onValidationFail(error);
      } else {
        console.error('Validation failed:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Add a new row to the table
   * @param defaultValues Default values for the new record
   * @param dataSource Current data source array
   * @param setDataSource Function to update data source state
   */
  const addRow = (
    defaultValues: Partial<T>,
    dataSource: T[],
    setDataSource: (data: T[]) => void
  ): void => {
    // Create a temporary id for the new record
    const tempId = `temp_${Date.now()}`;

    // Create new record with temporary id and default values
    const newRecord = {
      [idField]: tempId,
      ...defaultValues,
    } as unknown as T;

    // Add to data source
    setDataSource([...dataSource, newRecord]);

    // Start editing new record
    edit(newRecord);
  };

  return {
    form,
    editingKey,
    saving,
    isEditing,
    edit,
    cancel,
    save,
    addRow,
  };
}

export default useEditableTable;
