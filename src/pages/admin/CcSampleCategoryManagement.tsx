import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Button, Input, Space, message, Checkbox, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined, SettingOutlined, SaveOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import { stylePresets } from '../../config/theme';
import configurationService from '../../api/endpoints/configurationService';
import {
  CcSampleCategoryRs,
  CcSampleTypeRs,
  ConfigurationMaintenanceSelectors,
} from '../../models/types';
import CcSampleCategoryDetail from '../../components/cc-sample-categories/CcSampleCategoryDetail';
import CcSampleCategoriesList from '../../components/cc-sample-categories/CcSampleCategoriesList';

const { Text } = Typography;
const { TabPane } = Tabs;

const CcSampleCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CcSampleCategoryRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [filteredCategories, setFilteredCategories] = useState<CcSampleCategoryRs[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load CC sample categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch both categories and selectors in parallel
      const [categoriesData, selectorsData] = await Promise.all([
        configurationService.fetchCcSampleCategories(),
        configurationService.fetchSelectors(),
      ]);

      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load CC sample categories');
      message.error('Failed to load CC sample categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search text
  useEffect(() => {
    if (!categories.length) return;

    if (!searchText) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredCategories(filtered);
  }, [searchText, categories]);

  // Handle selecting a category
  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setActiveTab('detail');
  };

  // Handle deleting a category
  const handleDeleteCategory = (categoryId: number) => {
    // Only allow deleting categories with negative IDs (unsaved)
    const category = categories.find(c => c.ccSampleCategoryId === categoryId);

    if (!category) {
      message.error('Category not found');
      return;
    }

    if (categoryId >= 0) {
      message.error('Existing categories cannot be deleted');
      return;
    }

    // Check if the category has sample types
    if (category.ccSampleTypeRss && category.ccSampleTypeRss.length > 0) {
      message.error('Cannot delete category with associated sample types');
      return;
    }

    // Update the state to remove the deleted category
    const updatedCategories = categories.filter(c => c.ccSampleCategoryId !== categoryId);
    setCategories(updatedCategories);
    setFilteredCategories(filteredCategories.filter(c => c.ccSampleCategoryId !== categoryId));
    setHasChanges(true);

    message.success('Sample category deleted successfully');
  };

  // Handle creating a new category
  const handleAddCategory = () => {
    // Create a new category with default values
    const newCategory: CcSampleCategoryRs = {
      ccSampleCategoryId: -Date.now(), // Temporary negative ID
      name: 'New Sample Category',
      defaultCcSampleProductionMethodId: null,
      ccSampleTypeRss: [],
    };

    // Add to the array of categories
    setCategories([...categories, newCategory]);
    setFilteredCategories([...filteredCategories, newCategory]);
    setHasChanges(true);

    // Select the new category for editing
    setSelectedCategoryId(newCategory.ccSampleCategoryId);
    setActiveTab('detail');
  };

  // Handle updating a category
  const handleUpdateCategory = (updatedCategory: CcSampleCategoryRs) => {
    // Create a copy of our categories with the updated one
    const updatedCategories = categories.map(c =>
      c.ccSampleCategoryId === updatedCategory.ccSampleCategoryId ? updatedCategory : c
    );

    // If it's a new record (negative ID), replace it
    if (updatedCategory.ccSampleCategoryId < 0) {
      setCategories(updatedCategories);
      setFilteredCategories(prev =>
        prev.map(c =>
          c.ccSampleCategoryId === updatedCategory.ccSampleCategoryId ? updatedCategory : c
        )
      );
    } else {
      // For existing records, replace in both arrays
      setCategories(updatedCategories);
      setFilteredCategories(prev =>
        prev.map(c =>
          c.ccSampleCategoryId === updatedCategory.ccSampleCategoryId ? updatedCategory : c
        )
      );
    }

    setHasChanges(true);
    message.success(`Category "${updatedCategory.name}" updated successfully`);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);
      // Save the categories to the server
      const savedCategories = await configurationService.upsertCcSampleCategories(categories);

      // Update the state with the saved data
      setCategories(savedCategories);
      setFilteredCategories(savedCategories);
      setHasChanges(false);

      message.success('All changes saved successfully');
    } catch (err: any) {
      console.error('Error saving changes:', err);
      message.error(`Failed to save changes: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle back button click in detail view
  const handleBackToList = () => {
    setSelectedCategoryId(null);
    setActiveTab('list');
  };

  // Get the currently selected category
  const selectedCategory = categories.find(c => c.ccSampleCategoryId === selectedCategoryId);

  return (
    <div className="page-container">
      <PageHeader
        title="CC Sample Category Management"
        subtitle="Manage sample categories and types for the client system"
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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> Categories List
            </span>
          }
          key="list"
        >
          <CardSection
            title="Sample Categories"
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
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                  Add Category
                </Button>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Spin spinning={loading}>
              <CcSampleCategoriesList
                categories={filteredCategories}
                onSelectCategory={handleSelectCategory}
                onDeleteCategory={handleDeleteCategory}
                selectors={selectors}
              />
            </Spin>
          </CardSection>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined /> Category Details
            </span>
          }
          key="detail"
          disabled={!selectedCategoryId}
        >
          {selectedCategory && selectors ? (
            <CcSampleCategoryDetail
              category={selectedCategory}
              selectors={selectors}
              onUpdate={handleUpdateCategory}
              onBack={handleBackToList}
              saving={saving}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin spinning={loading} />
              {!loading && <Text>No category selected. Please select one from the list.</Text>}
            </div>
          )}
        </TabPane>
      </Tabs>

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
    </div>
  );
};

export default CcSampleCategoryManagement;
