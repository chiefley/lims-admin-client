// src/features/basicTables/TestCategoryManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, AppstoreOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Typography,
  Spin,
  Alert,
  Button,
  Input,
  Space,
  message,
  Checkbox,
  Tag,
  Select,
} from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import { fetchSelectors } from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import { fetchTestCategories, upsertTestCategories } from './basicTableService';
import { TestCategoryRs } from './types';

const { Text } = Typography;
const { Option } = Select;

const TestCategoryManagement: React.FC = () => {
  const [testCategories, setTestCategories] = useState<TestCategoryRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<TestCategoryRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [stateFilter, setStateFilter] = useState<number | null>(null);

  // Default state ID - from your documentation
  const defaultStateId = 2;

  // Load test categories and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both test categories and selectors in parallel
      const [categoriesData, selectorsData] = await Promise.all([
        fetchTestCategories(defaultStateId),
        fetchSelectors(),
      ]);

      setTestCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load test categories');
      message.error('Failed to load test categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter test categories based on search text, active status, and state filter
  useEffect(() => {
    if (!testCategories.length) return;

    let filtered = [...testCategories];

    // Filter by active status if not showing inactive
    if (!showInactive) {
      filtered = filtered.filter(category => category.active !== false);
    }

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        category =>
          category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Filter by state if selected
    if (stateFilter !== null) {
      filtered = filtered.filter(category => category.stateId === stateFilter);
    }

    setFilteredCategories(filtered);
  }, [searchText, testCategories, showInactive, stateFilter]);

  // Handle saving a test category
  const handleSaveCategory = (record: TestCategoryRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name?.trim()) {
          message.error('Test category name cannot be empty');
          reject('Name is required');
          return;
        }

        // Validate uniqueness of name within the same state
        const hasDuplicateName = testCategories.some(
          category =>
            category.testCategoryId !== record.testCategoryId && // Skip the current record
            category.name === record.name &&
            category.stateId === record.stateId
        );

        if (hasDuplicateName) {
          message.error('This test category name already exists for this state');
          reject('Duplicate name');
          return;
        }

        // Ensure active status is set (default to true if undefined)
        record.active = record.active !== false;

        // Update the test categories array
        setTestCategories(prevCategories => {
          const updatedCategories = prevCategories.map(category =>
            category.testCategoryId === record.testCategoryId ? record : category
          );

          // If it's a new record (not found in the array), add it
          if (!prevCategories.some(category => category.testCategoryId === record.testCategoryId)) {
            updatedCategories.push(record);
          }

          return updatedCategories;
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated test category: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting a test category
  const handleDeleteCategory = (record: TestCategoryRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.testCategoryId && record.testCategoryId >= 0) {
      message.info(
        'Existing test categories cannot be deleted. You can mark them as inactive instead.'
      );
      return;
    }

    // Remove from test categories array
    setTestCategories(prevCategories =>
      prevCategories.filter(c => c.testCategoryId !== record.testCategoryId)
    );

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted test category: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: TestCategoryRs) => {
    // Only show delete button for temporary records (negative IDs)
    return record.testCategoryId < 0;
  };

  // Handle adding a new test category
  const handleAddCategory = () => {
    // Create a new test category with default values and temporary negative ID
    const newCategory: TestCategoryRs = {
      testCategoryId: -Date.now(), // Temporary negative ID
      name: 'New Test Category',
      description: null,
      stateId: defaultStateId,
      ccTestPackageId: null,
      active: true, // New categories are active by default
    };

    // Add to the test categories array
    setTestCategories(prevCategories => [newCategory, ...prevCategories]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all test categories
      const savedCategories = await upsertTestCategories(testCategories);

      // Update local state with saved data from server
      setTestCategories(savedCategories);

      // Reset changes flag
      setHasChanges(false);

      message.success('All test categories saved successfully');
    } catch (err: any) {
      console.error('Error saving test categories:', err);
      message.error(`Failed to save test categories: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle showing inactive test categories
  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
  };

  // Table columns for the test categories list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string, record: TestCategoryRs) => (
        <Space>
          <Text strong style={{ opacity: record.active ? 1 : 0.5 }}>
            {text || 'New Test Category'}
          </Text>
          {record.active === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      sorter: (a: TestCategoryRs, b: TestCategoryRs) => (a.name || '').localeCompare(b.name || ''),
      rules: [
        { required: true, message: 'Please enter the test category name' },
        { max: 50, message: 'Name cannot exceed 50 characters' },
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
      title: 'CC Test Package ID',
      dataIndex: 'ccTestPackageId',
      key: 'ccTestPackageId',
      editable: true,
      inputType: 'number',
      width: 180,
      render: (id: number | null) => id || '-',
    },
    {
      title: 'State ID',
      dataIndex: 'stateId',
      key: 'stateId',
      editable: false,
      width: 100,
      render: (stateId: number) => <Text type="secondary">{stateId}</Text>,
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
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Test Category Management"
        subtitle="Manage test categories for laboratory analysis"
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
        icon={<AppstoreOutlined />}
        title="Test Categories"
        extra={
          <Space>
            <Input
              placeholder="Search test categories"
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
              onClick={handleAddCategory}
              disabled={loading || saving}
            >
              Add Test Category
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading || saving}>
          <EditableTable
            columns={columns}
            dataSource={filteredCategories}
            rowKey="testCategoryId"
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
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

export default TestCategoryManagement;
