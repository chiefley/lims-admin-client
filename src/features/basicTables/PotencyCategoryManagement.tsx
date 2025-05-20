// src/features/basicTables/PotencyCategoryManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, FireOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Select } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';

import { fetchPotencyCategories, upsertPotencyCategories } from './basicTableService';
import { PotencyCategoryRs } from './types';

const { Text } = Typography;
const { Option } = Select;

const PotencyCategoryManagement: React.FC = () => {
  const [potencyCategories, setPotencyCategories] = useState<PotencyCategoryRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<PotencyCategoryRs[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [stateFilter, setStateFilter] = useState<number | null>(null);

  // Default state ID - from your documentation
  const defaultStateId = 2;

  // Load potency categories
  useEffect(() => {
    loadPotencyCategories();
  }, []);

  const loadPotencyCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchPotencyCategories(defaultStateId);
      setPotencyCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load potency categories');
      message.error('Failed to load potency categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter potency categories based on search text and state filter
  useEffect(() => {
    if (!potencyCategories.length) return;

    let filtered = [...potencyCategories];

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filter by state if selected
    if (stateFilter !== null) {
      filtered = filtered.filter(category => category.stateId === stateFilter);
    }

    setFilteredCategories(filtered);
  }, [searchText, potencyCategories, stateFilter]);

  // Handle saving a potency category (single row edit in the table)
  const handleSaveCategory = (record: PotencyCategoryRs) => {
    // Use Promise to match the EditableTable's expected behavior
    return new Promise<void>((resolve, reject) => {
      // Validate the name is not empty
      if (!record.name.trim()) {
        message.error('Potency category name cannot be empty');
        reject('Name is required');
        return;
      }

      // Validate uniqueness of name within the same state
      const hasDuplicateName = potencyCategories.some(
        category =>
          category.potencyCategoryId !== record.potencyCategoryId && // Skip the current record
          category.name === record.name &&
          category.stateId === record.stateId
      );

      if (hasDuplicateName) {
        message.error('This potency category name already exists for this state');
        reject('Duplicate name');
        return;
      }

      // Update the potency categories array
      setPotencyCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category =>
          category.potencyCategoryId === record.potencyCategoryId ? record : category
        );

        // If it's a new record (not found in the array), add it
        if (
          !prevCategories.some(category => category.potencyCategoryId === record.potencyCategoryId)
        ) {
          updatedCategories.push(record);
        }

        return updatedCategories;
      });

      // Mark that we have unsaved changes
      setHasChanges(true);

      // Show success message and resolve the promise
      message.success(`Updated potency category: ${record.name}`);
      resolve();
    });
  };

  // Handle deleting a potency category
  const handleDeleteCategory = (record: PotencyCategoryRs) => {
    // Since potency categories have HARD DELETE IMPLEMENTATION, we allow deletion for all records
    // Note: For temporary (negative ID) records, we just remove them from the local state
    // For existing records, we'll need to confirm with the API

    if (record.potencyCategoryId < 0) {
      // Remove from local array for temporary records
      setPotencyCategories(prevCategories =>
        prevCategories.filter(c => c.potencyCategoryId !== record.potencyCategoryId)
      );

      // Mark that we have changes
      setHasChanges(true);

      message.success(`Deleted potency category: ${record.name}`);
    } else {
      // For existing records, we'll need to handle deletion through the API
      // This will be fully implemented when saving changes
      setPotencyCategories(prevCategories =>
        prevCategories.filter(c => c.potencyCategoryId !== record.potencyCategoryId)
      );

      // Mark that we have changes
      setHasChanges(true);

      message.success(`Marked potency category for deletion: ${record.name}`);
    }
  };

  // Always show delete button since potency categories support hard deletion
  const showDeleteButton = () => true;

  // Handle adding a new potency category
  const handleAddCategory = () => {
    // Create a new potency category with default values and temporary negative ID
    const newCategory: PotencyCategoryRs = {
      potencyCategoryId: -Date.now(), // Temporary negative ID
      name: 'New Potency Category',
      description: '',
      stateId: defaultStateId, // Default state ID
    };

    // Add to the potency categories array
    setPotencyCategories(prevCategories => [newCategory, ...prevCategories]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all potency categories
      const savedCategories = await upsertPotencyCategories(potencyCategories);

      // Update local state with saved data from server
      setPotencyCategories(savedCategories);

      // Reset changes flag
      setHasChanges(false);

      message.success('All potency categories saved successfully');
    } catch (err: any) {
      console.error('Error saving potency categories:', err);
      message.error(`Failed to save potency categories: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for the potency categories list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Potency Category'}</Text>,
      sorter: (a: PotencyCategoryRs, b: PotencyCategoryRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the potency category name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 250, message: 'Description cannot exceed 250 characters' }],
    },
    {
      title: 'State ID',
      dataIndex: 'stateId',
      key: 'stateId',
      editable: true,
      inputType: 'number',
      width: 100,
      render: (stateId: number) => stateId,
      rules: [{ required: true, message: 'Please enter the state ID' }],
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Potency Category Management"
        subtitle="Manage potency categories for state regulations"
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
            <Button type="primary" onClick={loadPotencyCategories}>
              Retry
            </Button>
          }
        />
      )}

      <CardSection
        icon={<FireOutlined />}
        title="Potency Categories"
        extra={
          <Space>
            <Input
              placeholder="Search categories"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by state"
              style={{ width: 150 }}
              value={stateFilter}
              onChange={setStateFilter}
              allowClear
            >
              <Option value={1}>State 1</Option>
              <Option value={2}>State 2</Option>
              <Option value={3}>State 3</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
              disabled={loading || saving}
            >
              Add Potency Category
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredCategories}
            rowKey="potencyCategoryId"
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
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

export default PotencyCategoryManagement;
