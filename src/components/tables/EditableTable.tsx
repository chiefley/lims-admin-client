import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Space, Tooltip, Popconfirm, DatePicker } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { TableProps } from 'antd/lib/table';
import dayjs from 'dayjs';
import EditableCell from './EditableCell';

// Define the column interface with the additional properties we need
export interface EditableColumn {
  dataIndex: string;
  title: string;
  inputType?: 'text' | 'select' | 'date' | 'number' | 'textarea';
  editable?: boolean;
  editComponent?: React.ComponentType<any>;
  rules?: any[];
  options?: { value: string | number; label: string }[];
  render?: (value: any, record: any) => React.ReactNode;
  [key: string]: any; // Allow for additional properties
}

interface EditableTableProps<RecordType extends Record<string, any>>
  extends Omit<TableProps<RecordType>, 'columns'> {
  columns: EditableColumn[];
  dataSource: RecordType[];
  onSave: (record: RecordType) => void;
  onDelete?: (record: RecordType) => void;
  onAdd?: (defaultValues?: any) => void;
  rowKey: string;
  editable?: boolean;
  addButtonText?: string;
  defaultValues?: any;
}

function EditableTable<RecordType extends Record<string, any>>({
  columns,
  dataSource,
  onSave,
  onDelete,
  onAdd,
  rowKey,
  editable = true,
  addButtonText = 'Add New',
  defaultValues = {},
  ...restProps
}: EditableTableProps<RecordType>) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<string | number>('');
  const [data, setData] = useState<RecordType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  const isEditing = (record: RecordType): boolean => {
    const key = record[rowKey]?.toString();
    return key === editingKey.toString();
  };

  const edit = (record: RecordType) => {
    // Process the record data to set form values correctly
    const formValues: Record<string, any> = { ...record };

    // Convert date fields for the form
    columns.forEach(col => {
      const dataIndex = col.dataIndex;
      if (col.inputType === 'date' && record[dataIndex]) {
        try {
          // Try to convert to dayjs safely
          const dateValue = record[dataIndex];
          if (typeof dateValue === 'string') {
            formValues[dataIndex] = dayjs(dateValue);
          }
        } catch (e) {
          console.warn(`Failed to convert date field ${col.dataIndex}`, e);
        }
      }
    });

    form.setFieldsValue(formValues);
    setEditingKey(record[rowKey]?.toString());
  };

  const cancel = () => {
    setEditingKey('');
    form.resetFields();
  };

  const save = async (record: RecordType) => {
    try {
      setSaving(true);

      // Get values from form
      const values = await form.validateFields();

      // Create a new object for the updated record using spread
      const updatedRecord = { ...record };

      // Process each field according to its type
      Object.keys(values).forEach(key => {
        const column = columns.find(col => col.dataIndex === key);
        const value = values[key];

        // Type-safe way to update the record
        if (column?.inputType === 'date' && value && dayjs.isDayjs(value)) {
          // Convert dayjs to ISO string
          (updatedRecord as any)[key] = value.toISOString();
        } else if (column?.inputType === 'date' && !value) {
          // If date value is null or undefined, explicitly set to null
          (updatedRecord as any)[key] = null;
        } else {
          // For all other types, use the value as is (which might be null)
          (updatedRecord as any)[key] = value;
        }
      });

      await onSave(updatedRecord);
      setEditingKey('');
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // Enhance columns with cell rendering logic
  const enhancedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: RecordType) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        inputType: col.inputType,
        editing: isEditing(record),
        form,
        rules: col.rules,
        options: col.options,
      }),
    };
  });

  // Add action column for edit/save/cancel buttons if editable
  const actionColumn: EditableColumn | null = editable
    ? {
        title: 'Actions',
        dataIndex: 'operation',
        width: '150px',
        render: (_: any, record: RecordType) => {
          const editable = isEditing(record);
          return editable ? (
            <Space>
              <Tooltip title="Save">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="small"
                  onClick={() => save(record)}
                  loading={saving}
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <Button icon={<CloseOutlined />} size="small" onClick={cancel} disabled={saving} />
              </Tooltip>
            </Space>
          ) : (
            <Space>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  disabled={editingKey !== ''}
                  onClick={() => edit(record)}
                />
              </Tooltip>
              {onDelete && (
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Are you sure you want to delete this item?"
                    onConfirm={() => onDelete(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      disabled={editingKey !== ''}
                    />
                  </Popconfirm>
                </Tooltip>
              )}
            </Space>
          );
        },
      }
    : null;

  // Add action column if editable
  const mergedColumns = [...enhancedColumns, ...(actionColumn ? [actionColumn] : [])];

  // Action buttons for the table (like Add button)
  const renderTableActions = () => {
    if (!editable || !onAdd) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            // Call onAdd with defaultValues
            onAdd(defaultValues);
          }}
          type="primary"
          icon={<PlusOutlined />}
          disabled={editingKey !== ''}
        >
          {addButtonText}
        </Button>
      </div>
    );
  };

  // Use our custom EditableCell component for table cells
  const components = {
    body: {
      cell: EditableCell,
    },
  };

  return (
    <>
      {renderTableActions()}
      <Form form={form} component="div">
        <Table
          components={components}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowKey={rowKey}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            pageSize: 10,
          }}
          {...restProps}
        />
      </Form>
    </>
  );
}

export default EditableTable;
