import React, { ReactNode, useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputProps, SelectProps, DatePickerProps } from 'antd';
import { FormInstance } from 'antd/lib/form';
import dayjs from 'dayjs';

interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'text' | 'select' | 'date' | 'number' | 'textarea';
  record: any;
  index: number;
  children: ReactNode;
  form: FormInstance;
  rules?: any[];
  inputProps?: InputProps | SelectProps | DatePickerProps | any;
  options?: { value: string | number; label: string }[];
}

/**
 * A cell component that can be switched between display mode and edit mode.
 * Used for in-place table editing.
 */
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  form,
  rules,
  inputProps = {},
  options,
  ...restProps
}) => {
  const [initialValue, setInitialValue] = useState<any>(null);

  useEffect(() => {
    if (editing && record) {
      let value = record[dataIndex];

      // Convert date strings to dayjs for DatePicker
      if (inputType === 'date' && value && typeof value === 'string') {
        value = dayjs(value);
      }

      setInitialValue(value);
      form.setFieldsValue({ [dataIndex]: value });
    }
  }, [editing, record, dataIndex, form, inputType]);

  let inputNode: ReactNode;

  switch (inputType) {
    case 'select':
      inputNode = (
        <Select {...inputProps} style={{ width: '100%' }}>
          {options?.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
      break;
    case 'date':
      inputNode = <DatePicker {...inputProps} style={{ width: '100%' }} />;
      break;
    case 'number':
      inputNode = <Input type="number" {...inputProps} />;
      break;
    case 'textarea':
      inputNode = <Input.TextArea {...inputProps} autoSize={{ minRows: 2, maxRows: 6 }} />;
      break;
    default:
      inputNode = <Input {...inputProps} />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} style={{ margin: 0 }} rules={rules} initialValue={initialValue}>
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default EditableCell;
