import React, { ReactNode } from 'react';
import { Form, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormItemProps } from 'antd/lib/form';

interface EnhancedFormItemProps extends FormItemProps {
  tooltip?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * Enhanced Form.Item component with consistent styling and optional tooltip
 */
const FormItem: React.FC<EnhancedFormItemProps> = ({
  tooltip,
  children,
  label,
  required,
  ...rest
}) => {
  // Prepare label with optional tooltip
  const formLabel = tooltip ? (
    <span>
      {label}{' '}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
      </Tooltip>
    </span>
  ) : (
    label
  );

  return (
    <Form.Item label={formLabel} required={required} {...rest}>
      {children}
    </Form.Item>
  );
};

export default FormItem;
