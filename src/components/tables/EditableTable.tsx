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

// Define the column interface with the additional properties we need
interface EditableColumn {
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
      const updatedRecord = { ...record } as RecordType;

      // Process each field according to its type
      Object.keys(values).forEach(key => {
        const column = columns.find(col => col.dataIndex === key);

        if (column?.inputType === 'date' && values[key]) {
          // Convert dayjs objects to ISO strings for API
          if (dayjs.isDayjs(values[key])) {
            updatedRecord[key] = values[key].toISOString();
          } else {
            updatedRecord[key] = values[key];
          }
        } else {
          updatedRecord[key] = values[key];
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

  // Render a cell based on whether it's in edit mode and its type
  const renderCell = (value: any, record: RecordType, column: EditableColumn) => {
    const editing = isEditing(record);

    if (!editing) {
      // Render display view
      if (column.render) {
        return column.render(value, record);
      }
      return value;
    }

    // Render edit view based on input type
    if (column.inputType === 'select') {
      return (
        <Form.Item name={column.dataIndex} style={{ margin: 0 }} rules={column.rules}>
          {column.editComponent ? (
            <column.editComponent options={column.options} style={{ width: '100%' }} />
          ) : (
            <span>No editor component</span>
          )}
        </Form.Item>
      );
    } else if (column.inputType === 'date') {
      return (
        <Form.Item name={column.dataIndex} style={{ margin: 0 }} rules={column.rules}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      );
    } else {
      return (
        <Form.Item name={column.dataIndex} style={{ margin: 0 }} rules={column.rules}>
          {column.editComponent ? (
            <column.editComponent style={{ width: '100%' }} />
          ) : (
            <span>No editor component</span>
          )}
        </Form.Item>
      );
    }
  };

  // Add action column for edit/save/cancel buttons if editable
  const actionColumn: EditableColumn = editable
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

  // Enhance columns with cell rendering logic
  const enhancedColumns = columns.map(col => ({
    ...col,
    onCell: (record: RecordType) => ({
      record,
      dataIndex: col.dataIndex,
      title: col.title,
      editing: isEditing(record),
    }),
    render: (value: any, record: RecordType) => renderCell(value, record, col),
  }));

  // Add action column if editable
  const mergedColumns = [...enhancedColumns, ...(actionColumn ? [actionColumn] : [])];

  // Action buttons for the table (like Add button)
  const renderTableActions = () => {
    if (!editable || !onAdd) return null;

    return (
      <div style={{ marginBottom: 16 }}>
        <Button
          onClick={() => onAdd(defaultValues)}
          type="primary"
          icon={<PlusOutlined />}
          disabled={editingKey !== ''}
        >
          {addButtonText}
        </Button>
      </div>
    );
  };

  return (
    <>
      {renderTableActions()}
      <Form form={form} component="div">
        <Table
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
