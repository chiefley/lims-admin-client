// src/features/basicTables/ItemTypeManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, BuildOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Checkbox, Tabs, Tag } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import sharedService from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import basicTableService from './basicTableService';
import { ItemTypeRs, ItemCategoryRs } from './types';

const { Text } = Typography;
const { TabPane } = Tabs;

const ItemTypeManagement: React.FC = () => {
  // State for item types and related data
  const [itemTypes, setItemTypes] = useState<ItemTypeRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredItemTypes, setFilteredItemTypes] = useState<ItemTypeRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');

  // Default state ID - from your documentation
  const defaultStateId = 2;

  // Load item types and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both item types and selectors in parallel
      const [itemTypesData, selectorsData] = await Promise.all([
        basicTableService.fetchItemTypes(defaultStateId),
        sharedService.fetchSelectors(),
      ]);

      setItemTypes(itemTypesData);
      setFilteredItemTypes(itemTypesData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load item types');
      message.error('Failed to load item types');
    } finally {
      setLoading(false);
    }
  };

  // Filter item types based on search text, active status, and tab
  useEffect(() => {
    if (!itemTypes.length) return;

    let filtered = [...itemTypes];

    // Filter by active status if not showing inactive
    if (!showInactive) {
      filtered = filtered.filter(itemType => itemType.active !== false);
    }

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        itemType =>
          itemType.name.toLowerCase().includes(searchText.toLowerCase()) ||
          itemType.itemCategories.some(category =>
            category.name?.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    // Apply tab filter if not on "all" tab
    if (activeTabKey !== 'all') {
      // Filter by reportPercent
      if (activeTabKey === 'reportPercent') {
        filtered = filtered.filter(itemType => itemType.reportPercent === true);
      } else if (activeTabKey === 'noReportPercent') {
        filtered = filtered.filter(itemType => itemType.reportPercent === false);
      }
    }

    setFilteredItemTypes(filtered);
  }, [searchText, itemTypes, showInactive, activeTabKey]);

  // Handle saving an item type
  const handleSaveItemType = (record: ItemTypeRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name.trim()) {
          message.error('Item type name cannot be empty');
          reject('Name is required');
          return;
        }

        // Update the itemTypes array
        setItemTypes(prevItemTypes => {
          const updatedItemTypes = prevItemTypes.map(itemType =>
            itemType.itemTypeId === record.itemTypeId ? record : itemType
          );

          // If it's a new record (not found in the array), add it
          if (!prevItemTypes.some(itemType => itemType.itemTypeId === record.itemTypeId)) {
            updatedItemTypes.push(record);
          }

          return updatedItemTypes;
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated item type: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle saving an item category
  const handleSaveItemCategory = (itemTypeId: number, record: ItemCategoryRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name?.trim()) {
          message.error('Category name cannot be empty');
          reject('Name is required');
          return;
        }

        // Update the itemTypes array to include the updated category
        setItemTypes(prevItemTypes => {
          return prevItemTypes.map(itemType => {
            if (itemType.itemTypeId === itemTypeId) {
              const updatedCategories = [...itemType.itemCategories];
              const categoryIndex = updatedCategories.findIndex(
                category => category.itemCategoryId === record.itemCategoryId
              );

              if (categoryIndex >= 0) {
                // Update existing category
                updatedCategories[categoryIndex] = record;
              } else {
                // Add new category
                updatedCategories.push(record);
              }

              return {
                ...itemType,
                itemCategories: updatedCategories,
              };
            }
            return itemType;
          });
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated category: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting an item type
  const handleDeleteItemType = (record: ItemTypeRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.itemTypeId >= 0) {
      message.info('Existing item types cannot be deleted. You can mark them as inactive instead.');
      return;
    }

    // Remove from item types array
    setItemTypes(prevItemTypes => prevItemTypes.filter(t => t.itemTypeId !== record.itemTypeId));

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted item type: ${record.name}`);
  };

  // Handle deleting an item category
  const handleDeleteItemCategory = (itemTypeId: number, record: ItemCategoryRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.itemCategoryId >= 0) {
      message.info('Existing categories cannot be deleted. You can mark them as inactive instead.');
      return;
    }

    // Remove the category from the item type
    setItemTypes(prevItemTypes => {
      return prevItemTypes.map(itemType => {
        if (itemType.itemTypeId === itemTypeId) {
          return {
            ...itemType,
            itemCategories: itemType.itemCategories.filter(
              c => c.itemCategoryId !== record.itemCategoryId
            ),
          };
        }
        return itemType;
      });
    });

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted category: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: any) => {
    // Only show delete button for temporary records (negative IDs)
    if ('itemTypeId' in record) {
      return record.itemTypeId < 0;
    } else if ('itemCategoryId' in record) {
      return record.itemCategoryId < 0;
    }
    return false;
  };

  // Handle adding a new item type
  const handleAddItemType = () => {
    // Create a new item type with default values and temporary negative ID
    const newItemType: ItemTypeRs = {
      itemTypeId: -Date.now(), // Temporary negative ID
      name: 'New Item Type',
      stateId: defaultStateId,
      reportPercent: false,
      active: true,
      itemCategories: [],
    };

    // Add to the item types array
    setItemTypes(prevItemTypes => [newItemType, ...prevItemTypes]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Handle adding a new category to an item type
  const handleAddItemCategory = (itemTypeId: number) => {
    // Create a new category with default values and temporary negative ID
    const newCategory: ItemCategoryRs = {
      itemCategoryId: -Date.now(), // Temporary negative ID
      name: 'New Category',
      description: '',
      itemTypeId: itemTypeId,
      suppressQfQn: false,
      stateId: defaultStateId,
      ccSampleTypeId: null,
      suppressLimits: false,
      active: true,
    };

    // Add the category to the item type
    setItemTypes(prevItemTypes => {
      return prevItemTypes.map(itemType => {
        if (itemType.itemTypeId === itemTypeId) {
          return {
            ...itemType,
            itemCategories: [...itemType.itemCategories, newCategory],
          };
        }
        return itemType;
      });
    });

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all item types
      const savedItemTypes = await basicTableService.upsertItemTypes(itemTypes, defaultStateId);

      // Update local state with saved data from server
      setItemTypes(savedItemTypes);

      // Reset changes flag
      setHasChanges(false);

      message.success('All item types saved successfully');
    } catch (err: any) {
      console.error('Error saving item types:', err);
      message.error(`Failed to save item types: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for the item types list
  const itemTypeColumns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string, record: ItemTypeRs) => (
        <Space>
          <Text strong style={{ opacity: record.active ? 1 : 0.5 }}>
            {text}
          </Text>
          {record.active === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      sorter: (a: ItemTypeRs, b: ItemTypeRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the item type name' },
        { max: 250, message: 'Name cannot exceed 250 characters' },
      ],
    },
    {
      title: 'State',
      dataIndex: 'stateId',
      key: 'stateId',
      editable: true,
      inputType: 'number',
      width: 100,
      render: (stateId: number | null) => stateId || defaultStateId,
    },
    {
      title: 'Report Percent',
      dataIndex: 'reportPercent',
      key: 'reportPercent',
      editable: true,
      inputType: 'select',
      width: 150,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean | null) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Categories',
      dataIndex: 'itemCategories',
      key: 'categoriesCount',
      editable: false,
      width: 120,
      render: (categories: ItemCategoryRs[]) => categories?.length || 0,
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

  // Get columns for the item categories table
  const getItemCategoryColumns = (itemTypeId: number): EditableColumn[] => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string, record: ItemCategoryRs) => (
        <Space>
          <Text strong style={{ opacity: record.active ? 1 : 0.5 }}>
            {text || ''}
          </Text>
          {record.active === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      sorter: (a: ItemCategoryRs, b: ItemCategoryRs) => (a.name || '').localeCompare(b.name || ''),
      rules: [
        { required: true, message: 'Please enter the category name' },
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
      title: 'CC Sample Type',
      dataIndex: 'ccSampleTypeId',
      key: 'ccSampleTypeId',
      editable: true,
      inputType: 'select',
      options:
        selectors?.ccSampleTypes?.map(type => ({
          value: type.id,
          label: type.label,
        })) || [],
      render: (id: number | null) => {
        if (!id || !selectors) return 'Not Assigned';
        const item = selectors.ccSampleTypes?.find(type => type.id === id);
        return item ? item.label : `ID: ${id}`;
      },
      inputProps: {
        allowClear: true,
      },
    },
    {
      title: 'Suppress QF/QN',
      dataIndex: 'suppressQfQn',
      key: 'suppressQfQn',
      editable: true,
      inputType: 'select',
      width: 140,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Suppress Limits',
      dataIndex: 'suppressLimits',
      key: 'suppressLimits',
      editable: true,
      inputType: 'select',
      width: 140,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: true,
      inputType: 'select',
      width: 100,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (active: boolean) =>
        active ? <Text type="success">Active</Text> : <Text type="secondary">Inactive</Text>,
    },
  ];

  // Create expandable row content for each item type to show its categories
  const expandedRowRender = (record: ItemTypeRs) => {
    return (
      <div style={{ margin: '0 16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddItemCategory(record.itemTypeId)}
          >
            Add Category
          </Button>
        </div>

        <EditableTable
          columns={getItemCategoryColumns(record.itemTypeId)}
          dataSource={record.itemCategories}
          rowKey="itemCategoryId"
          onSave={category => handleSaveItemCategory(record.itemTypeId, category as ItemCategoryRs)}
          onDelete={category =>
            handleDeleteItemCategory(record.itemTypeId, category as ItemCategoryRs)
          }
          editable={!saving}
          size="small"
          pagination={false}
          showDeleteButton={showDeleteButton}
          rowClassName={category => (category.active === false ? 'inactive-row' : '')}
        />
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Item Type Management"
        subtitle="Manage item types and their categories"
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
        icon={<BuildOutlined />}
        title="Item Types"
        extra={
          <Space>
            <Input
              placeholder="Search item types"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Checkbox checked={showInactive} onChange={e => setShowInactive(e.target.checked)}>
              Show Inactive
            </Checkbox>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItemType}
              disabled={loading || saving}
            >
              Add Item Type
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="All Item Types" key="all" />
          <TabPane tab="Report Percent" key="reportPercent" />
          <TabPane tab="No Report Percent" key="noReportPercent" />
        </Tabs>

        <Spin spinning={loading || saving}>
          <EditableTable
            columns={itemTypeColumns}
            dataSource={filteredItemTypes}
            rowKey="itemTypeId"
            onSave={handleSaveItemType}
            onDelete={handleDeleteItemType}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
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

export default ItemTypeManagement;
