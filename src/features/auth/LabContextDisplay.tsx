// src/features/auth/LabContextDisplay.tsx
import React from 'react';

import {
  InfoCircleOutlined,
  ExperimentOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Descriptions, Typography, Tag, Space, Alert } from 'antd';

import { useAuth } from './AuthContext';

const { Title, Text } = Typography;

interface LabContextDisplayProps {
  style?: React.CSSProperties;
  showUserInfo?: boolean;
  compact?: boolean;
}

/**
 * Component for displaying current user and lab context information
 */
const LabContextDisplay: React.FC<LabContextDisplayProps> = ({
  style,
  showUserInfo = true,
  compact = false,
}) => {
  const { user, currentLab, currentStateId, userLabs } = useAuth();

  // Don't render if no context available
  if (!user || !currentLab) {
    return (
      <Alert
        message="No Context Available"
        description="User or laboratory context is not available"
        type="warning"
        showIcon
        style={style}
      />
    );
  }

  if (compact) {
    return (
      <Space style={style} size="middle">
        {showUserInfo && (
          <Space size="small">
            <UserOutlined />
            <Text strong>{user.username}</Text>
          </Space>
        )}

        <Space size="small">
          <ExperimentOutlined />
          <Text strong>{currentLab.labName}</Text>
          <Tag color="blue">{currentLab.stateAbbreviation}</Tag>
        </Space>

        <Text type="secondary">
          ({userLabs.length} lab{userLabs.length !== 1 ? 's' : ''} available)
        </Text>
      </Space>
    );
  }

  return (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>Current Context</span>
        </Space>
      }
      size="small"
      style={style}
    >
      <Descriptions column={1} size="small">
        {showUserInfo && (
          <>
            <Descriptions.Item label="User">
              <Space>
                <Text strong>{user.username}</Text>
                {user.roles.map(role => (
                  <Tag key={role} color="green">
                    {role}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </>
        )}

        <Descriptions.Item label="Laboratory">
          <Space>
            <ExperimentOutlined />
            <Text strong>{currentLab.labName}</Text>
            {currentLab.isDefaultLab && <Tag color="gold">Default</Tag>}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="State">
          <Space>
            <EnvironmentOutlined />
            <Text>{currentLab.stateAbbreviation}</Text>
            <Text type="secondary">(ID: {currentStateId})</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Lab Access">
          <Text>
            {userLabs.length} laborator{userLabs.length !== 1 ? 'ies' : 'y'} available
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Context IDs">
          <Text type="secondary">
            Lab ID: {currentLab.labId} | State ID: {currentStateId}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default LabContextDisplay;
