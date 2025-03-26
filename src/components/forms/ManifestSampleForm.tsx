// src/components/forms/ManifestSampleForm.tsx

import React from 'react';
import { Form, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { ManifestSamplePrepBatchSopRs, SopMaintenanceSelectors } from '../../models/types';

interface ManifestSampleFormProps {
  initialValues: ManifestSamplePrepBatchSopRs;
  selectors: SopMaintenanceSelectors;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const ManifestSampleForm: React.FC<ManifestSampleFormProps> = ({
  initialValues,
  selectors,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // Format date for form initialization
  const formattedInitialValues = {
    ...initialValues,
    // Use 0 as a fallback for number fields
    manifestSampleTypeId: initialValues.manifestSampleTypeId || 0,
    panelGroupId: initialValues.panelGroupId || 0,
    effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : dayjs(),
  };

  // Set initial form values
  React.useEffect(() => {
    form.setFieldsValue(formattedInitialValues);
  }, [formattedInitialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the date back to string for API submission
      const formattedValues = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format('YYYY-MM-DD') : '',
      };

      onSubmit({
        ...initialValues,
        ...formattedValues,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formattedInitialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="manifestSampleTypeId"
        label="Sample Type"
        rules={[{ required: true, message: 'Please select a sample type' }]}
      >
        <Select>
          {selectors.manifestSampleTypeItems.map(type => (
            <Select.Option key={type.id} value={type.id}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="panelGroupId"
        label="Panel Group"
        rules={[{ required: true, message: 'Please select a panel group' }]}
      >
        <Select>
          {selectors.panelGroupItems.map(group => (
            <Select.Option key={group.id} value={group.id}>
              {group.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="effectiveDate"
        label="Effective Date"
        rules={[{ required: true, message: 'Please select an effective date' }]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ManifestSampleForm;
