import React, { useState, useEffect, ReactNode } from 'react';
import { Table, Form, Button, Space, Tooltip, Popconfirm } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { TableProps } from 'antd/lib/table';
import EditableCell from './EditableCell';
import useEditableTable from '../../hooks/useEditableTable';

interface EditableTableProps<RecordType> extends Omit<TableProps<RecordType>, 'columns'> {
  columns: any[];
  dataSource: RecordType[];
  onSave: (record: RecordType) => void;
  onDelete?: (record: RecordType) => void;
  onAdd?: (defaultValues?: any) => void;
  rowKey: string;
  editable?: boolean;
  addButtonText?: string;
  defaultValues?: any;
}

/**
 * A table component that supports in-place row editing
 */
function EditableTable<RecordType extends object = any>({
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
  const [data, setData] = useState<RecordType[]>([]);

  // Use the custom hook for editable table functionality
  const {
    form,
    editingKey,
    saving,
    isEditing,
    edit,
    cancel,
    save: saveRecord,
  } = useEditableTable<RecordType>({
    onSave,
    idField: rowKey,
  });

  // Update local data when dataSource prop changes
  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  // Handle saving a record
  const handleSave = async (record: RecordType) => {
    await saveRecord(record);
  };

  // Add action column for edit/save/cancel buttons if editable
  const actionColumn = editable
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
                  onClick={() => handleSave(record)}
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

  // Add the action column if editable mode is enabled
  const mergedColumns = [...columns, ...(actionColumn ? [actionColumn] : [])].map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: RecordType) => ({
        record,
        inputType: col.inputType || 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        form,
        rules: col.rules,
        inputProps: col.inputProps,
        options: col.options,
      }),
    };
  });

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
          components={{
            body: {
              cell: EditableCell,
            },
          }}
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
