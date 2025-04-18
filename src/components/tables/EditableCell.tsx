import React, { ReactNode, useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  InputProps,
  SelectProps,
  DatePickerProps,
} from 'antd';
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
  [key: string]: any; // Allow for additional properties
}

/**
 * A cell component that can be switched between display mode and edit mode.
 * Used for in-place table editing.
 */
const EditableCell: React.FC<EditableCellProps> = props => {
  const {
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
  } = props;

  const [initialValue, setInitialValue] = useState<any>(null);

  useEffect(() => {
    if (editing && record) {
      let value = record[dataIndex];

      // Safely convert date strings to dayjs for DatePicker
      if (inputType === 'date' && value) {
        if (typeof value === 'string') {
          try {
            // Use a safer way to convert to dayjs
            value = dayjs(value);

            // Verify it's a valid date
            if (!value.isValid()) {
              console.warn(`Invalid date detected for field ${dataIndex}:`, record[dataIndex]);
              value = dayjs(); // Fallback to current date if invalid
            }
          } catch (err) {
            console.error(`Error converting date for field ${dataIndex}:`, err);
            value = dayjs(); // Fallback to current date on error
          }
        } else if (!dayjs.isDayjs(value)) {
          // If it's not a string or dayjs object, use current date
          value = dayjs();
        }
      }

      setInitialValue(value);
      form.setFieldsValue({ [dataIndex]: value });
    }
  }, [editing, record, dataIndex, form, inputType]);

  let inputNode: ReactNode;

  switch (inputType) {
    case 'select':
      // Handle both standard select and combobox modes
      const isCombobox = inputProps?.mode === 'combobox';
      inputNode = (
        <Select
          {...inputProps}
          style={{ width: '100%' }}
          showSearch={inputProps.showSearch !== false}
        >
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
      inputNode = <InputNumber style={{ width: '100%' }} min={0} {...inputProps} />;
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
