import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';
import { ManifestSamplePrepBatchSopRs, SopMaintenanceSelectors } from '../../models/types';
import FormItem from '../../components/common/FormItem';

interface ManifestSampleFormProps {
  initialValues: ManifestSamplePrepBatchSopRs;
  selectors: SopMaintenanceSelectors;
  onSubmit: (values: ManifestSamplePrepBatchSopRs) => void;
  onCancel: () => void;
}

const ManifestSampleForm: React.FC<ManifestSampleFormProps> = ({
  initialValues,
  selectors,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    // Set form values directly, preserving the original IDs
    form.setFieldsValue({
      ...initialValues,
      effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : dayjs(),
    });
  }, [form, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the date back to ISO string for API submission
      const formattedValues = {
        ...initialValues,
        ...values,
        effectiveDate: values.effectiveDate.toISOString(),
      };

      onSubmit(formattedValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Debugging helper - shows the current state
  useEffect(() => {
    console.log('Current initialValues:', initialValues);
    console.log('Available panel groups:', selectors.panelGroupItems);
  }, [initialValues, selectors]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Hidden fields for IDs */}
      <Form.Item name="manifestSamplePrepBatchSopId" hidden>
        <input type="hidden" />
      </Form.Item>

      <Form.Item name="batchSopId" hidden>
        <input type="hidden" />
      </Form.Item>

      {/* Sample Type dropdown */}
      <FormItem
        name="manifestSampleTypeId"
        label="Sample Type"
        tooltip="Select the type of sample for this SOP configuration"
        required
        rules={[{ required: true, message: 'Please select a sample type' }]}
      >
        <Select placeholder="Select sample type">
          {selectors.manifestSampleTypeItems.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </FormItem>

      {/* Panel Group dropdown */}
      <FormItem
        name="panelGroupId"
        label="Panel Group"
        tooltip="Select the panel group for this sample type"
        required
        rules={[{ required: true, message: 'Please select a panel group' }]}
      >
        <Select placeholder="Select panel group">
          {selectors.panelGroupItems.map(item => (
            <Select.Option key={item.id} value={item.id}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </FormItem>

      {/* Display-only field for Panels */}
      {initialValues.panels && (
        <FormItem label="Panels" tooltip="Panels associated with this sample type (read-only)">
          <div
            style={{
              padding: '4px 11px',
              border: '1px solid #d9d9d9',
              borderRadius: '2px',
              backgroundColor: '#f5f5f5',
            }}
          >
            {initialValues.panels}
          </div>
        </FormItem>
      )}

      {/* Effective Date */}
      <FormItem
        name="effectiveDate"
        label="Effective Date"
        tooltip="Date when this sample type configuration becomes effective"
        required
        rules={[{ required: true, message: 'Please select an effective date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </FormItem>

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
