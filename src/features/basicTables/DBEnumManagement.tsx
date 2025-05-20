// src/features/basicTables/DBEnumManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, TableOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Select, Tag } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import sharedService from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import basicTableService from './basicTableService';
import { DBEnumRs } from './types';

const { Text } = Typography;
const { Option } = Select;

const DBEnumManagement: React.FC = () => {
  const [dbEnums, setDbEnums] = useState<DBEnumRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredDbEnums, setFilteredDbEnums] = useState<DBEnumRs[]>([]);
  const [enumTypeFilter, setEnumTypeFilter] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load DB enums and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both DB enums and selectors in parallel
      const [dbEnumsData, selectorsData] = await Promise.all([
        basicTableService.fetchDBEnums(),
        sharedService.fetchSelectors(),
      ]);

      setDbEnums(dbEnumsData);
      setFilteredDbEnums(dbEnumsData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load DB enums');
      message.error('Failed to load DB enums');
    } finally {
      setLoading(false);
    }
  };

  // Filter DB enums based on search text and enum type filter
  useEffect(() => {
    if (!dbEnums.length) return;

    let filtered = [...dbEnums];

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        dbEnum =>
          dbEnum.name.toLowerCase().includes(searchText.toLowerCase()) ||
          dbEnum.enum.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by enum type if selected
    if (enumTypeFilter) {
      filtered = filtered.filter(dbEnum => dbEnum.enum === enumTypeFilter);
    }

    setFilteredDbEnums(filtered);
  }, [searchText, dbEnums, enumTypeFilter]);

  // Get unique enum types for filtering
  const getUniqueEnumTypes = (): string[] => {
    const enumTypes = dbEnums.map(dbEnum => dbEnum.enum);
    // Use a more compatible approach to get unique values
    const uniqueEnumTypes = Array.from(new Set(enumTypes));
    return uniqueEnumTypes.sort();
  };

  // Handle saving a DB enum (single row edit in the table)
  const handleSaveDbEnum = (record: DBEnumRs) => {
    // Use Promise to match the EditableTable's expected behavior
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name?.trim()) {
          message.error('Name cannot be empty');
          reject('Name is required');
          return;
        }

        // Validate the enum type is not empty
        if (!record.enum?.trim()) {
          message.error('Enum type cannot be empty');
          reject('Enum type is required');
          return;
        }

        // Validate uniqueness of name within the same enum type
        const hasDuplicate = dbEnums.some(
          dbEnum =>
            dbEnum.dbEnumId !== record.dbEnumId && // Skip the current record
            dbEnum.name === record.name &&
            dbEnum.enum === record.enum &&
            dbEnum.labId === record.labId
        );

        if (hasDuplicate) {
          message.error('This name already exists for this enum type');
          reject('Duplicate name');
          return;
        }

        // Update the DB enums array
        setDbEnums(prevDbEnums => {
          const updatedDbEnums = prevDbEnums.map(dbEnum =>
            dbEnum.dbEnumId === record.dbEnumId ? record : dbEnum
          );

          // If it's a new record (not found in the array), add it
          if (!prevDbEnums.some(dbEnum => dbEnum.dbEnumId === record.dbEnumId)) {
            updatedDbEnums.push(record);
          }

          return updatedDbEnums;
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated DB enum: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting a DB enum
  const handleDeleteDbEnum = (record: DBEnumRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.dbEnumId >= 0) {
      message.info('Existing DB enums cannot be deleted. They are integral to system operations.');
      return;
    }

    // Remove from DB enums array
    setDbEnums(prevDbEnums => prevDbEnums.filter(e => e.dbEnumId !== record.dbEnumId));

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted DB enum: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: DBEnumRs) => {
    // Only show delete button for temporary records (negative IDs)
    return record.dbEnumId < 0;
  };

  // Handle adding a new DB enum
  const handleAddDbEnum = () => {
    // Create a new DB enum with default values and temporary negative ID
    const newDbEnum: DBEnumRs = {
      dbEnumId: -Date.now(), // Temporary negative ID
      name: '',
      enum: enumTypeFilter || '', // Use currently selected enum type if available
      labId: 1001, // Default lab ID from your configuration
    };

    // Add to the DB enums array
    setDbEnums(prevDbEnums => [newDbEnum, ...prevDbEnums]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all DB enums
      const savedDbEnums = await basicTableService.upsertDBEnums(dbEnums);

      // Update local state with saved data from server
      setDbEnums(savedDbEnums);

      // Reset changes flag
      setHasChanges(false);

      message.success('All DB enums saved successfully');
    } catch (err: any) {
      console.error('Error saving DB enums:', err);
      message.error(`Failed to save DB enums: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for the DB enums list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New DB Enum'}</Text>,
      sorter: (a: DBEnumRs, b: DBEnumRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Enum Type',
      dataIndex: 'enum',
      key: 'enum',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dbEnumTypes?.map(type => ({
          value: type.label,
          label: type.label,
        })) || [],
      inputProps: {
        showSearch: true,
        allowClear: true,
        placeholder: 'Select or enter enum type',
      },
      render: (text: string) => <Tag color="blue">{text}</Tag>,
      sorter: (a: DBEnumRs, b: DBEnumRs) => a.enum.localeCompare(b.enum),
      rules: [
        { required: true, message: 'Please enter the enum type' },
        { max: 150, message: 'Enum type cannot exceed 150 characters' },
      ],
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
        title="DB Enum Management"
        subtitle="Manage database enumerations used in the system"
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
        icon={<TableOutlined />}
        title="Database Enumerations"
        extra={
          <Space>
            <Input
              placeholder="Search DB enums"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by enum type"
              style={{ width: 200 }}
              value={enumTypeFilter}
              onChange={setEnumTypeFilter}
              allowClear
            >
              {getUniqueEnumTypes().map(enumType => (
                <Option key={enumType} value={enumType}>
                  {enumType}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDbEnum}
              disabled={loading || saving}
            >
              Add DB Enum
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredDbEnums}
            rowKey="dbEnumId"
            onSave={handleSaveDbEnum}
            onDelete={handleDeleteDbEnum}
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

export default DBEnumManagement;
