// src/components/forms/PrepBatchSopForm.tsx

import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { PrepBatchSopSelectionRs } from '../../models/types';

interface PrepBatchSopFormProps {
  initialValues: PrepBatchSopSelectionRs;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const PrepBatchSopForm: React.FC<PrepBatchSopFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  // Set initial form values
  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      <Form.Item
        name="name"
        label="Name"
        rules={[
          { required: true, message: 'Please enter the Prep SOP name' },
          { max: 150, message: 'Name cannot exceed 150 characters' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="sop"
        label="SOP"
        rules={[
          { required: true, message: 'Please enter the SOP identifier' },
          { max: 50, message: 'SOP cannot exceed 50 characters' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="version"
        label="Version"
        rules={[
          { required: true, message: 'Please enter the version' },
          { max: 10, message: 'Version cannot exceed 10 characters' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="sopGroup"
        label="SOP Group"
        rules={[
          { required: true, message: 'Please enter the SOP group' },
          { max: 50, message: 'SOP Group cannot exceed 50 characters' },
        ]}
      >
        <Input />
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

export default PrepBatchSopForm;
