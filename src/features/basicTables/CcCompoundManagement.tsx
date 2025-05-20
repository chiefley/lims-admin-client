import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, ExperimentOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Tabs } from 'antd';

import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import sharedService from '../shared/sharedService';

import basicTableService from './basicTableService';
import { CcSampleCategoryRs, CcSampleTypeRs } from './types';

const { Text } = Typography;
const { TabPane } = Tabs;

const CcCompoundManagement: React.FC = () => {
  const [categories, setCategories] = useState<CcSampleCategoryRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<CcSampleCategoryRs[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [selectors, setSelectors] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load CC sample categories and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both categories and selectors in parallel
      const [categoriesData, selectorsData] = await Promise.all([
        basicTableService.fetchCcSampleCategories(),
        sharedService.fetchSelectors(),
      ]);

      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load CC compounds data');
      message.error('Failed to load CC compounds data');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search text and active tab
  useEffect(() => {
    if (!categories.length) return;

    let filtered = [...categories];

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          category.ccSampleTypeRss.some(type =>
            type.name.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    // Apply tab filter if not on "all" tab
    if (activeTabKey !== 'all') {
      // This is just an example - replace with actual filtering logic
      // if you have specific categories you want to filter by
      filtered = filtered.filter(category => {
        if (activeTabKey === 'production') {
          return category.name.toLowerCase().includes('production');
        }
        return true;
      });
    }

    setFilteredCategories(filtered);
  }, [searchText, categories, activeTabKey]);

  // Handle saving a category
  const handleSaveCategory = (record: CcSampleCategoryRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name.trim()) {
          message.error('Category name cannot be empty');
          reject('Name is required');
          return;
        }

        // Update the categories array
        setCategories(prevCategories => {
          const updatedCategories = prevCategories.map(category =>
            category.ccSampleCategoryId === record.ccSampleCategoryId ? record : category
          );

          // If it's a new record (not found in the array), add it
          if (
            !prevCategories.some(
              category => category.ccSampleCategoryId === record.ccSampleCategoryId
            )
          ) {
            updatedCategories.push(record);
          }

          return updatedCategories;
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

  // Handle saving a sample type
  const handleSaveSampleType = (categoryId: number, record: CcSampleTypeRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate the name is not empty
        if (!record.name.trim()) {
          message.error('Sample type name cannot be empty');
          reject('Name is required');
          return;
        }

        // Update the categories array
        setCategories(prevCategories => {
          return prevCategories.map(category => {
            if (category.ccSampleCategoryId === categoryId) {
              const updatedTypes = [...category.ccSampleTypeRss];
              const typeIndex = updatedTypes.findIndex(
                type => type.ccSampleTypeId === record.ccSampleTypeId
              );

              if (typeIndex >= 0) {
                // Update existing type
                updatedTypes[typeIndex] = record;
              } else {
                // Add new type
                updatedTypes.push(record);
              }

              return {
                ...category,
                ccSampleTypeRss: updatedTypes,
              };
            }
            return category;
          });
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated sample type: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting a category
  const handleDeleteCategory = (record: CcSampleCategoryRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.ccSampleCategoryId >= 0) {
      message.info(
        'Existing categories cannot be deleted. They are integral to system operations.'
      );
      return;
    }

    // Remove from categories array
    setCategories(prevCategories =>
      prevCategories.filter(c => c.ccSampleCategoryId !== record.ccSampleCategoryId)
    );

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted category: ${record.name}`);
  };

  // Handle deleting a sample type
  const handleDeleteSampleType = (categoryId: number, record: CcSampleTypeRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.ccSampleTypeId >= 0) {
      message.info(
        'Existing sample types cannot be deleted. They are integral to system operations.'
      );
      return;
    }

    // Remove the sample type from the category
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.ccSampleCategoryId === categoryId) {
          return {
            ...category,
            ccSampleTypeRss: category.ccSampleTypeRss.filter(
              t => t.ccSampleTypeId !== record.ccSampleTypeId
            ),
          };
        }
        return category;
      });
    });

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted sample type: ${record.name}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: CcSampleCategoryRs | CcSampleTypeRs) => {
    // Only show delete button for temporary records (negative IDs)
    return 'ccSampleCategoryId' in record
      ? record.ccSampleCategoryId < 0
      : record.ccSampleTypeId < 0;
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    // Create a new category with default values and temporary negative ID
    const newCategory: CcSampleCategoryRs = {
      ccSampleCategoryId: -Date.now(), // Temporary negative ID
      name: 'New Category',
      defaultCcSampleProductionMethodId: null,
      ccSampleTypeRss: [],
    };

    // Add to the categories array
    setCategories(prevCategories => [newCategory, ...prevCategories]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Handle adding a new sample type to a category
  const handleAddSampleType = (categoryId: number) => {
    // Create a new sample type with default values and temporary negative ID
    const newSampleType: CcSampleTypeRs = {
      ccSampleTypeId: -Date.now(), // Temporary negative ID
      categoryId: categoryId,
      name: 'New Sample Type',
    };

    // Add the sample type to the category
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        if (category.ccSampleCategoryId === categoryId) {
          return {
            ...category,
            ccSampleTypeRss: [...category.ccSampleTypeRss, newSampleType],
          };
        }
        return category;
      });
    });

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all categories and their sample types
      const savedCategories = await basicTableService.upsertCcSampleCategories(categories);

      // Update local state with saved data from server
      setCategories(savedCategories);

      // Reset changes flag
      setHasChanges(false);

      message.success('All CC compound data saved successfully');
    } catch (err: any) {
      console.error('Error saving CC compound data:', err);
      message.error(`Failed to save CC compound data: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for categories
  const categoryColumns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Category'}</Text>,
      sorter: (a: CcSampleCategoryRs, b: CcSampleCategoryRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the category name' },
        { max: 50, message: 'Name cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Default Production Method',
      dataIndex: 'defaultCcSampleProductionMethodId',
      key: 'defaultCcSampleProductionMethodId',
      editable: true,
      inputType: 'select',
      options:
        selectors?.ccSampleProductionMethods?.map((m: any) => ({
          value: m.id,
          label: m.label,
        })) || [],
      render: (methodId: number | null) => {
        if (!methodId || !selectors) return 'Not Set';
        const method = selectors.ccSampleProductionMethods?.find((m: any) => m.id === methodId);
        return method ? method.label : `ID: ${methodId}`;
      },
    },
    {
      title: 'Sample Types Count',
      dataIndex: 'ccSampleTypeRss',
      key: 'sampleTypesCount',
      render: (types: CcSampleTypeRs[], record: CcSampleCategoryRs) => types?.length || 0,
      width: 150,
      editable: false,
    },
  ];

  // Function to get table columns for sample types
  const getSampleTypeColumns = (categoryId: number): EditableColumn[] => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text>{text || 'New Sample Type'}</Text>,
      sorter: (a: CcSampleTypeRs, b: CcSampleTypeRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the sample type name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
  ];

  // Create expandable row content for each category
  const expandedRowRender = (record: CcSampleCategoryRs) => {
    return (
      <div style={{ margin: '0 16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddSampleType(record.ccSampleCategoryId)}
          >
            Add Sample Type
          </Button>
        </div>

        <EditableTable
          columns={getSampleTypeColumns(record.ccSampleCategoryId)}
          dataSource={record.ccSampleTypeRss}
          rowKey="ccSampleTypeId"
          onSave={sampleType =>
            handleSaveSampleType(record.ccSampleCategoryId, sampleType as CcSampleTypeRs)
          }
          onDelete={sampleType =>
            handleDeleteSampleType(record.ccSampleCategoryId, sampleType as CcSampleTypeRs)
          }
          editable={!saving}
          size="small"
          pagination={false}
          showDeleteButton={showDeleteButton}
        />
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="CC Compound Management"
        subtitle="Manage CC compounds, categories, and sample types"
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
        icon={<ExperimentOutlined />}
        title="CC Compound Categories"
        extra={
          <Space>
            <Input
              placeholder="Search categories and types"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
              disabled={loading || saving}
            >
              Add Category
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="All Categories" key="all" />
          <TabPane tab="Production" key="production" />
          {/* Add more tabs as needed */}
        </Tabs>

        <Spin spinning={loading || saving}>
          <EditableTable
            columns={categoryColumns}
            dataSource={filteredCategories}
            rowKey="ccSampleCategoryId"
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
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

export default CcCompoundManagement;
