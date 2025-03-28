import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Alert } from 'antd';
import { PrepBatchSopSelectionRs } from '../../models/types';
import FormItem from '../../components/common/FormItem';

interface PrepBatchSopFormProps {
  initialValues: PrepBatchSopSelectionRs;
  onSubmit: (values: PrepBatchSopSelectionRs) => void;
  onCancel: () => void;
}

const PrepBatchSopForm: React.FC<PrepBatchSopFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // Set initial form values
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Preserve the manifestSamplePrepBatchSopRss array and other fields
      onSubmit({
        ...initialValues,
        ...values,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
      {/* Hidden fields - not displayed to user but needed for API */}
      <Form.Item name="batchSopId" hidden={true}>
        <input type="hidden" />
      </Form.Item>

      <Form.Item name="labId" hidden={true}>
        <input type="hidden" />
      </Form.Item>

      <Form.Item name="$type" hidden={true}>
        <input type="hidden" />
      </Form.Item>

      {/* Show validation message about unique combination */}
      <Alert
        message="Validation Note"
        description="The combination of Name, SOP, and Version must be unique."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Name field with validation */}
      <FormItem
        name="name"
        label="Name"
        tooltip="The name of the Prep Batch SOP"
        required
        rules={[
          { required: true, message: 'Please enter the Prep SOP name' },
          { max: 150, message: 'Name cannot exceed 150 characters' },
        ]}
      >
        <Input placeholder="Enter SOP name" />
      </FormItem>

      {/* SOP field with validation */}
      <FormItem
        name="sop"
        label="SOP"
        tooltip="The SOP identifier"
        required
        rules={[
          { required: true, message: 'Please enter the SOP identifier' },
          { max: 50, message: 'SOP cannot exceed 50 characters' },
        ]}
      >
        <Input placeholder="Enter SOP identifier" />
      </FormItem>

      {/* Version field with validation */}
      <FormItem
        name="version"
        label="Version"
        tooltip="The version of the SOP"
        required
        rules={[
          { required: true, message: 'Please enter the version' },
          { max: 10, message: 'Version cannot exceed 10 characters' },
        ]}
      >
        <Input placeholder="Enter version (e.g., 1.0)" />
      </FormItem>

      {/* SOP Group field with validation */}
      <FormItem
        name="sopGroup"
        label="SOP Group"
        tooltip="The group to which this SOP belongs"
        required
        rules={[
          { required: true, message: 'Please enter the SOP group' },
          { max: 50, message: 'SOP Group cannot exceed 50 characters' },
        ]}
      >
        <Input placeholder="Enter SOP group" />
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

export default PrepBatchSopForm;
