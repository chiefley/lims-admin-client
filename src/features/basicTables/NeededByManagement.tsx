// src/features/basicTables/NeededByManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, ScheduleOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Select } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import { fetchSelectors } from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import { fetchNeededByConfigurations, upsertNeededByConfigurations } from './basicTableService';
import { NeededByRs } from './types';

const { Text } = Typography;
const { Option } = Select;

const NeededByManagement: React.FC = () => {
  const [neededByConfigs, setNeededByConfigs] = useState<NeededByRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredConfigs, setFilteredConfigs] = useState<NeededByRs[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [testCategoryFilter, setTestCategoryFilter] = useState<number | null>(null);

  // Default lab ID from your configuration
  const defaultLabId = 1001;

  // Load needed by configs and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both needed by configs and selectors in parallel
      const [configsData, selectorsData] = await Promise.all([
        fetchNeededByConfigurations(),
        fetchSelectors(),
      ]);

      setNeededByConfigs(configsData);
      setFilteredConfigs(configsData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load needed by configurations');
      message.error('Failed to load needed by configurations');
    } finally {
      setLoading(false);
    }
  };

  // Filter needed by configs based on search text and test category filter
  useEffect(() => {
    if (!neededByConfigs.length) return;

    let filtered = [...neededByConfigs];

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(config => {
        // Find test category name for the search
        let testCategoryName = '';
        if (config.testCategoryId && selectors) {
          const category = selectors.testCategoryTypes.find(c => c.id === config.testCategoryId);
          testCategoryName = category?.label || '';
        }

        // Search in relevant fields
        return (
          config.receivedDow?.toLowerCase().includes(searchText.toLowerCase()) ||
          config.neededByDow?.toLowerCase().includes(searchText.toLowerCase()) ||
          config.neededByTime?.toLowerCase().includes(searchText.toLowerCase()) ||
          testCategoryName.toLowerCase().includes(searchText.toLowerCase())
        );
      });
    }

    // Filter by test category if selected
    if (testCategoryFilter !== null) {
      filtered = filtered.filter(config => config.testCategoryId === testCategoryFilter);
    }

    setFilteredConfigs(filtered);
  }, [searchText, neededByConfigs, testCategoryFilter, selectors]);

  // Handle saving a needed by config
  const handleSaveConfig = (record: NeededByRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate required fields
        if (!record.receivedDow) {
          message.error('Received day of week is required');
          reject('Received day of week is required');
          return;
        }

        if (!record.neededByDow) {
          message.error('Needed by day of week is required');
          reject('Needed by day of week is required');
          return;
        }

        if (!record.neededByTime) {
          message.error('Needed by time is required');
          reject('Needed by time is required');
          return;
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(record.neededByTime)) {
          message.error('Time must be in the format HH:mm (e.g., 13:30)');
          reject('Invalid time format');
          return;
        }

        // Ensure the record has a lab ID
        record.labId = defaultLabId;

        // Update the needed by configs array
        setNeededByConfigs(prevConfigs => {
          const updatedConfigs = prevConfigs.map(config =>
            config.neededById === record.neededById ? record : config
          );

          // If it's a new record (not found in the array), add it
          if (!prevConfigs.some(config => config.neededById === record.neededById)) {
            updatedConfigs.push(record);
          }

          return updatedConfigs;
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated needed by configuration`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting a needed by config
  const handleDeleteConfig = (record: NeededByRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.neededById >= 0) {
      message.info(
        'Existing needed by configurations cannot be deleted. They are integral to system operations.'
      );
      return;
    }

    // Remove from needed by configs array
    setNeededByConfigs(prevConfigs => prevConfigs.filter(c => c.neededById !== record.neededById));

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted needed by configuration`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: NeededByRs) => {
    // Only show delete button for temporary records (negative IDs)
    return record.neededById < 0;
  };

  // Handle adding a new needed by config
  const handleAddConfig = () => {
    // Create a new needed by config with default values and temporary negative ID
    const newConfig: NeededByRs = {
      neededById: -Date.now(), // Temporary negative ID
      testCategoryId: null,
      microSelected: false,
      receivedDow: null,
      neededByDow: null,
      neededByTime: null,
      labId: defaultLabId,
    };

    // Add to the needed by configs array
    setNeededByConfigs(prevConfigs => [newConfig, ...prevConfigs]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all needed by configs
      const savedConfigs = await upsertNeededByConfigurations(neededByConfigs);

      // Update local state with saved data from server
      setNeededByConfigs(savedConfigs);

      // Reset changes flag
      setHasChanges(false);

      message.success('All needed by configurations saved successfully');
    } catch (err: any) {
      console.error('Error saving needed by configurations:', err);
      message.error(`Failed to save needed by configurations: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for the needed by configs list
  const columns: EditableColumn[] = [
    {
      title: 'Test Category',
      dataIndex: 'testCategoryId',
      key: 'testCategoryId',
      editable: true,
      inputType: 'select',
      options:
        selectors?.testCategoryTypes?.map(category => ({
          value: category.id,
          label: category.label,
        })) || [],
      inputProps: {
        allowClear: true,
        placeholder: 'Select test category',
      },
      render: (id: number | null) => {
        if (!id || !selectors) return 'Not Specified';
        const category = selectors.testCategoryTypes.find(c => c.id === id);
        return category ? category.label : `ID: ${id}`;
      },
      sorter: (a: NeededByRs, b: NeededByRs) => {
        if (!a.testCategoryId && !b.testCategoryId) return 0;
        if (!a.testCategoryId) return -1;
        if (!b.testCategoryId) return 1;
        return a.testCategoryId - b.testCategoryId;
      },
    },
    {
      title: 'Micro Selected',
      dataIndex: 'microSelected',
      key: 'microSelected',
      editable: true,
      inputType: 'select',
      width: 150,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean | null) => (value ? <Text type="success">Yes</Text> : 'No'),
    },
    {
      title: 'Received Day',
      dataIndex: 'receivedDow',
      key: 'receivedDow',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dayOfWeeks?.map(day => ({
          value: day.label,
          label: day.label,
        })) || [],
      render: (text: string) => <Text strong>{text || 'Not Set'}</Text>,
      rules: [{ required: true, message: 'Please select a received day of week' }],
    },
    {
      title: 'Needed By Day',
      dataIndex: 'neededByDow',
      key: 'neededByDow',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dayOfWeeks?.map(day => ({
          value: day.label,
          label: day.label,
        })) || [],
      render: (text: string) => <Text strong>{text || 'Not Set'}</Text>,
      rules: [{ required: true, message: 'Please select a needed by day of week' }],
    },
    {
      title: 'Needed By Time',
      dataIndex: 'neededByTime',
      key: 'neededByTime',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'Not Set'}</Text>,
      rules: [
        { required: true, message: 'Please enter a needed by time' },
        {
          pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          message: 'Time must be in the format HH:mm (e.g., 13:30)',
        },
      ],
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Needed By Management"
        subtitle="Manage when test results are needed by for various test categories"
        extra={
          hasChanges && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          )
        }
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button type="primary" onClick={loadData}>
              Retry
            </Button>
          }
        />
      )}

      <CardSection
        icon={<ScheduleOutlined />}
        title="Needed By Configurations"
        extra={
          <Space>
            <Input
              placeholder="Search configurations"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by test category"
              style={{ width: 200 }}
              value={testCategoryFilter}
              onChange={setTestCategoryFilter}
              allowClear
            >
              {selectors?.testCategoryTypes?.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.label}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddConfig}
              disabled={loading || saving}
            >
              Add Configuration
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredConfigs}
            rowKey="neededById"
            onSave={handleSaveConfig}
            onDelete={handleDeleteConfig}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 20 }}
            showDeleteButton={showDeleteButton}
          />
        </Spin>

        {hasChanges && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          </div>
        )}
      </CardSection>
    </div>
  );
};

export default NeededByManagement;
