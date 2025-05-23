// src/features/auth/LabSelector.tsx
import React from 'react';

import { ExperimentOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Select, Button, Space, Typography, Tag, Tooltip, message } from 'antd';

import { useAuth } from './AuthContext';

const { Text } = Typography;
const { Option } = Select;

interface LabSelectorProps {
  style?: React.CSSProperties;
  showRefreshButton?: boolean;
  size?: 'small' | 'middle' | 'large';
}

/**
 * Component for selecting and switching between available laboratories
 */
const LabSelector: React.FC<LabSelectorProps> = ({
  style,
  showRefreshButton = true,
  size = 'middle',
}) => {
  const { currentLab, userLabs, switchLab, refreshUserLabs, isLoading } = useAuth();

  // Handle lab change
  const handleLabChange = (labId: number) => {
    const success = switchLab(labId);
    if (success) {
      const selectedLab = userLabs.find(lab => lab.labId === labId);
      message.success(`Switched to ${selectedLab?.labName}`);
    } else {
      message.error('Failed to switch laboratory');
    }
  };

  // Handle refresh labs
  const handleRefreshLabs = async () => {
    try {
      await refreshUserLabs();
      message.success('Laboratory list refreshed');
    } catch (error) {
      message.error('Failed to refresh laboratory list');
    }
  };

  // Don't render if no labs available
  if (!userLabs || userLabs.length === 0) {
    return null;
  }

  return (
    <Space style={style} size="small">
      <ExperimentOutlined />
      <Text strong>Lab:</Text>

      <Select
        value={currentLab?.labId}
        onChange={handleLabChange}
        style={{ minWidth: 200 }}
        size={size}
        loading={isLoading}
        placeholder="Select Laboratory"
      >
        {userLabs.map(lab => (
          <Option key={lab.labId} value={lab.labId}>
            <Space>
              <span>{lab.labName}</span>
              <Tag color="blue">{lab.stateAbbreviation}</Tag>
              {lab.isDefaultLab && (
                <Tooltip title="Default Laboratory">
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                </Tooltip>
              )}
            </Space>
          </Option>
        ))}
      </Select>

      {showRefreshButton && (
        <Tooltip title="Refresh laboratory list">
          <Button
            icon={<ReloadOutlined />}
            size={size}
            onClick={handleRefreshLabs}
            loading={isLoading}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default LabSelector;
