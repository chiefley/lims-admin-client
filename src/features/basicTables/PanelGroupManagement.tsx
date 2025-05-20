// src/features/basicTables/PanelGroupManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, AppstoreOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Checkbox, Tag } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';

import { fetchPanelGroups, upsertPanelGroups } from './basicTableService';
import { PanelGroupRs } from './types';

const { Text } = Typography;

const PanelGroupManagement: React.FC = () => {
  const [panelGroups, setPanelGroups] = useState<PanelGroupRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPanelGroups, setFilteredPanelGroups] = useState<PanelGroupRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Default lab ID from your configuration
  const defaultLabId = 1001;

  // Load panel groups
  useEffect(() => {
    loadPanelGroups();
  }, []);

  const loadPanelGroups = async () => {
    try {
      setLoading(true);
      const panelGroupsData = await fetchPanelGroups();
      setPanelGroups(panelGroupsData);
      setFilteredPanelGroups(panelGroupsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load panel groups');
      message.error('Failed to load panel groups');
    } finally {
      setLoading(false);
    }
  };

  // Filter panel groups based on search text and active status
  useEffect(() => {
    if (!panelGroups.length) return;

    let filtered = [...panelGroups];

    // Filter by active status if not showing inactive
    if (!showInactive) {
      filtered = filtered.filter(panelGroup => panelGroup.active !== false);
    }

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(panelGroup =>
        panelGroup.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredPanelGroups(filtered);
  }, [searchText, panelGroups, showInactive]);

  // Handle saving a panel group (single row edit in the table)
  const handleSavePanelGroup = (record: PanelGroupRs) => {
    // Use Promise to match the EditableTable's expected behavior
    return new Promise<void>((resolve, reject) => {
      // Validate the name is not empty
      if (!record.name?.trim()) {
        message.error('Panel group name cannot be empty');
        reject('Name is required');
        return;
      }

      // Validate uniqueness of name
      const hasDuplicateName = panelGroups.some(
        group =>
          group.panelGroupId !== record.panelGroupId && // Skip the current record
          group.name === record.name &&
          group.labId === record.labId
      );

      if (hasDuplicateName) {
        message.error('This panel group name already exists');
        reject('Duplicate name');
        return;
      }

      // Ensure the record has a lab ID
      record.labId = defaultLabId;

      // Update the panel groups array
      setPanelGroups(prevPanelGroups => {
        const updatedPanelGroups = prevPanelGroups.map(group =>
          group.panelGroupId === record.panelGroupId ? record : group
        );

        // If it's a new record (not found in the array), add it
        if (!prevPanelGroups.some(group => group.panelGroupId === record.panelGroupId)) {
          updatedPanelGroups.push(record);
        }

        return updatedPanelGroups;
      });

      // Mark that we have unsaved changes
      setHasChanges(true);

      // Show success message and resolve the promise
      message.success(`Updated panel group: ${record.name}`);
      resolve();
    });
  };

  // Handle deleting a panel group
  const handleDeletePanelGroup = (record: PanelGroupRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.panelGroupId >= 0) {
      message.info(
        'Existing panel groups cannot be deleted. You can mark them as inactive instead.'
      );
      return;
    }

    // Remove from panel groups array
    setPanelGroups(prevPanelGroups =>
      prevPanelGroups.filter(g => g.panelGroupId !== record.panelGroupId)
    );

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted panel group: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: PanelGroupRs) => {
    // Only show delete button for temporary records (negative IDs)
    return record.panelGroupId < 0;
  };

  // Handle adding a new panel group
  const handleAddPanelGroup = () => {
    // Create a new panel group with default values and temporary negative ID
    const newPanelGroup: PanelGroupRs = {
      panelGroupId: -Date.now(), // Temporary negative ID
      name: 'New Panel Group',
      labId: defaultLabId,
      active: true, // New panel groups are active by default
    };

    // Add to the panel groups array
    setPanelGroups(prevPanelGroups => [newPanelGroup, ...prevPanelGroups]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all panel groups
      const savedPanelGroups = await upsertPanelGroups(panelGroups);

      // Update local state with saved data from server
      setPanelGroups(savedPanelGroups);

      // Reset changes flag
      setHasChanges(false);

      message.success('All panel groups saved successfully');
    } catch (err: any) {
      console.error('Error saving panel groups:', err);
      message.error(`Failed to save panel groups: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle showing inactive panel groups
  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
  };

  // Table columns for the panel groups list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string, record: PanelGroupRs) => (
        <Space>
          <Text strong style={{ opacity: record.active ? 1 : 0.5 }}>
            {text || 'New Panel Group'}
          </Text>
          {record.active === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      sorter: (a: PanelGroupRs, b: PanelGroupRs) => (a.name || '').localeCompare(b.name || ''),
      rules: [
        { required: true, message: 'Please enter the panel group name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: true,
      inputType: 'select',
      width: 120,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (active: boolean) =>
        active ? <Text type="success">Active</Text> : <Text type="secondary">Inactive</Text>,
    },
    {
      title: 'Lab ID',
      dataIndex: 'labId',
      key: 'labId',
      editable: false,
      width: 100,
      render: (text: number) => <Text type="secondary">{text}</Text>,
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Panel Group Management"
        subtitle="Manage panel groups used to categorize analysis panels"
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
            <Button type="primary" onClick={loadPanelGroups}>
              Retry
            </Button>
          }
        />
      )}

      <CardSection
        icon={<AppstoreOutlined />}
        title="Panel Groups"
        extra={
          <Space>
            <Input
              placeholder="Search panel groups"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Checkbox
              checked={showInactive}
              onChange={e => handleShowInactiveChange(e.target.checked)}
            >
              Show Inactive
            </Checkbox>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPanelGroup}
              disabled={loading || saving}
            >
              Add Panel Group
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredPanelGroups}
            rowKey="panelGroupId"
            onSave={handleSavePanelGroup}
            onDelete={handleDeletePanelGroup}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 20 }}
            rowClassName={record => (record.active === false ? 'inactive-row' : '')}
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

export default PanelGroupManagement;
