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

  // Format date for form initialization
  const formattedInitialValues = {
    ...initialValues,
    // Use null as fallback for number fields to ensure dropdowns show placeholder
    manifestSampleTypeId: initialValues.manifestSampleTypeId || null,
    panelGroupId: initialValues.panelGroupId || null,
    // Convert ISO date string to dayjs object for DatePicker
    effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : dayjs(),
  };

  // Set initial form values
  useEffect(() => {
    form.setFieldsValue(formattedInitialValues);
  }, [form, formattedInitialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the date back to ISO string for API submission
      const formattedValues = {
        ...initialValues,
        ...values,
        // Ensure we're using ISO format for the date
        effectiveDate: values.effectiveDate.toISOString(),
      };

      onSubmit(formattedValues);
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
      {/* Hidden fields for IDs - not displayed to user but needed for API */}
      <Form.Item name="manifestSamplePrepBatchSopId" hidden={true}>
        <input type="hidden" />
      </Form.Item>

      <Form.Item name="batchSopId" hidden={true}>
        <input type="hidden" />
      </Form.Item>

      {/* Sample Type dropdown - populated with SopMaintenanceSelectors.ManifestSampleTypeItems */}
      <FormItem
        name="manifestSampleTypeId"
        label="Sample Type"
        tooltip="Select the type of sample for this SOP configuration"
        required
        rules={[{ required: true, message: 'Please select a sample type' }]}
      >
        <Select placeholder="Select sample type">
          {selectors.manifestSampleTypeItems.map(type => (
            <Select.Option key={type.id} value={type.id}>
              {type.label}
            </Select.Option>
          ))}
        </Select>
      </FormItem>

      {/* Panel Group dropdown - populated with SopMaintenanceSelectors.PanelGroupItems */}
      <FormItem
        name="panelGroupId"
        label="Panel Group"
        tooltip="Select the panel group for this sample type"
        required
        rules={[{ required: true, message: 'Please select a panel group' }]}
      >
        <Select placeholder="Select panel group">
          {selectors.panelGroupItems.map(group => (
            <Select.Option key={group.id} value={group.id}>
              {group.label}
            </Select.Option>
          ))}
        </Select>
      </FormItem>

      {/* Display-only field for Panels - not editable per API comments */}
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

      {/* Effective Date - required per API comments */}
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
