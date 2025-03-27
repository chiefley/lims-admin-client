import React, { ReactNode } from 'react';
import { Typography, Space, Button, Divider } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children?: ReactNode;
}

/**
 * Consistent page header component for all pages
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra, children }) => {
  return (
    <div className="page-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        {extra && <div>{extra}</div>}
      </div>

      {children && <div style={{ marginTop: 16 }}>{children}</div>}

      <Divider className="divider-light" />
    </div>
  );
};

export default PageHeader;
