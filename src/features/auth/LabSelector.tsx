// src/features/auth/LabSelector.tsx
import React from 'react';

import { ExperimentOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Select, Button, Space, Typography, Tag, Tooltip, message } from 'antd';

import { useNavigationProtection } from '../../contexts/NavigationProtectionContext';

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
 * Now includes protection for unsaved changes
 */
const LabSelector: React.FC<LabSelectorProps> = ({
  style,
  showRefreshButton = true,
  size = 'middle',
}) => {
  const { currentLab, userLabs, refreshUserLabs, isLoading } = useAuth();
  const { protectedSwitchLab } = useNavigationProtection();

  // Handle lab change with protection - this is the key change!
  const handleLabChange = (labId: number) => {
    protectedSwitchLab(labId);
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
