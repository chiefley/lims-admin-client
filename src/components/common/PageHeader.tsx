import React, { ReactNode } from 'react';
import { Typography, Space, Divider } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: ReactNode; // Changed from string to ReactNode to allow for elements
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
          {typeof title === 'string' ? (
            <Title level={2} style={{ margin: 0 }}>
              {title}
            </Title>
          ) : (
            title
          )}
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
