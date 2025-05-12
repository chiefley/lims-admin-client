import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, MenuOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Tabs, Tag, Select } from 'antd';

import configurationService from '../../api/endpoints/configurationService';
import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import { NavMenuItemRs } from './types';

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const NavMenuItemManagement: React.FC = () => {
  const [navMenuItems, setNavMenuItems] = useState<NavMenuItemRs[]>([]);
  const [flatNavMenuItems, setFlatNavMenuItems] = useState<NavMenuItemRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredNavMenuItems, setFilteredNavMenuItems] = useState<NavMenuItemRs[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');

  // Lab ID from your configuration
  const defaultLabId = 1001;

  // Load nav menu items and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both nav menu items and selectors in parallel
      const [navMenuItemsData, selectorsData] = await Promise.all([
        configurationService.fetchNavMenuItems(),
        configurationService.fetchSelectors(),
      ]);

      setNavMenuItems(navMenuItemsData);
      setFilteredNavMenuItems(navMenuItemsData);

      // Create a flattened version of all menu items (for parent selection dropdown)
      const flatItems = flattenNavMenuItems(navMenuItemsData);
      setFlatNavMenuItems(flatItems);

      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load navigation menu items');
      message.error('Failed to load navigation menu items');
    } finally {
      setLoading(false);
    }
  };

  // Recursively flatten the hierarchical nav menu items into a flat array
  const flattenNavMenuItems = (items: NavMenuItemRs[]): NavMenuItemRs[] => {
    let result: NavMenuItemRs[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.childItems && item.childItems.length > 0) {
        result = [...result, ...flattenNavMenuItems(item.childItems)];
      }
    });
    return result;
  };

  // Filter nav menu items based on search text and active tab
  useEffect(() => {
    if (!navMenuItems.length) return;

    let filtered = [...navMenuItems];

    // Filter by search text if provided
    if (searchText) {
      // Create recursive search function to search in child items too
      const searchInItems = (items: NavMenuItemRs[]): NavMenuItemRs[] => {
        return items.filter(item => {
          const nameMatch = item.name?.toLowerCase().includes(searchText.toLowerCase());
          const slugMatch = item.slug?.toLowerCase().includes(searchText.toLowerCase());
          const urlMatch = item.url?.toLowerCase().includes(searchText.toLowerCase());

          // Check if any child items match the search
          let childMatches = false;
          if (item.childItems && item.childItems.length > 0) {
            const matchingChildren = searchInItems(item.childItems);
            childMatches = matchingChildren.length > 0;
            // Replace the child items with the matching ones
            if (childMatches) {
              item = { ...item, childItems: matchingChildren };
            }
          }

          return nameMatch || slugMatch || urlMatch || childMatches;
        });
      };

      filtered = searchInItems(filtered);
    }

    // Apply tab filter if not on "all" tab
    if (activeTabKey !== 'all') {
      // Create filtered version based on tab
      const filterByTab = (items: NavMenuItemRs[]): NavMenuItemRs[] => {
        return items.filter(item => {
          // First check if the item matches the filter
          let matches = false;

          switch (activeTabKey) {
            case 'main':
              matches = !item.parentNavMenuItemId; // Top-level items
              break;
            case 'child':
              matches = !!item.parentNavMenuItemId; // Child items only
              break;
            case 'withUrl':
              matches = !!item.url; // Items with URLs
              break;
            case 'withoutUrl':
              matches = !item.url; // Items without URLs
              break;
          }

          // Keep items with matching children
          if (!matches && item.childItems && item.childItems.length > 0) {
            const matchingChildren = filterByTab(item.childItems);
            if (matchingChildren.length > 0) {
              item = { ...item, childItems: matchingChildren };
              return true;
            }
          }

          return matches;
        });
      };

      filtered = filterByTab(filtered);
    }

    setFilteredNavMenuItems(filtered);
  }, [searchText, navMenuItems, activeTabKey]);

  // Handle saving a nav menu item
  const handleSaveNavMenuItem = (record: NavMenuItemRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate required fields
        if (!record.name?.trim()) {
          message.error('Menu item name cannot be empty');
          reject('Name is required');
          return;
        }

        if (!record.slug?.trim()) {
          message.error('Menu item slug cannot be empty');
          reject('Slug is required');
          return;
        }

        if (!record.pageTitle?.trim()) {
          message.error('Page title cannot be empty');
          reject('Page title is required');
          return;
        }

        // Handle parent menu item selection
        if (record.parentNavMenuItemId && record.parentNavMenuItemId !== 0) {
          // Make sure we're not creating a circular reference
          let parentId: number | null | undefined = record.parentNavMenuItemId;
          const itemId = record.navMenuItemId;

          // Check the ancestry chain
          while (parentId) {
            if (parentId === itemId) {
              message.error('Cannot set parent to create a circular reference');
              reject('Circular reference detected');
              return;
            }

            // Find the parent item to check its parent
            const parentItem = flatNavMenuItems.find(item => item.navMenuItemId === parentId);
            // Convert to number or undefined (which will exit the while loop)
            parentId = parentItem?.parentNavMenuItemId ?? undefined;
          }
        }

        // Make sure order is a number
        if (record.order === null || record.order === undefined) {
          record.order = 0;
        }

        // Ensure labId is set
        record.labId = defaultLabId;

        // Update the nav menu items array by updating the entire structure
        // This is more complex because of the hierarchical nature
        const updateNavMenuItem = (items: NavMenuItemRs[]): [NavMenuItemRs[], boolean] => {
          let updated = false;
          const newItems = items.map(item => {
            if (item.navMenuItemId === record.navMenuItemId) {
              updated = true;
              return record;
            }

            if (item.childItems && item.childItems.length > 0) {
              const [newChildren, childUpdated] = updateNavMenuItem(item.childItems);
              if (childUpdated) {
                updated = true;
                return { ...item, childItems: newChildren };
              }
            }

            return item;
          });

          return [newItems, updated];
        };

        // Try to update existing item
        const [updatedItems, wasUpdated] = updateNavMenuItem(navMenuItems);

        if (wasUpdated) {
          // Item was found and updated
          setNavMenuItems(updatedItems);
        } else {
          // This is a new item - determine if it's top-level or a child
          if (record.parentNavMenuItemId) {
            // Add as a child to the specified parent
            const addChildToParent = (items: NavMenuItemRs[]): NavMenuItemRs[] => {
              return items.map(item => {
                if (item.navMenuItemId === record.parentNavMenuItemId) {
                  return {
                    ...item,
                    childItems: [...(item.childItems || []), record],
                  };
                }

                if (item.childItems && item.childItems.length > 0) {
                  return {
                    ...item,
                    childItems: addChildToParent(item.childItems),
                  };
                }

                return item;
              });
            };

            setNavMenuItems(addChildToParent(navMenuItems));
          } else {
            // Add as a new top-level item
            setNavMenuItems([...navMenuItems, record]);
          }
        }

        // Update the flat list of all items for parent dropdowns
        setFlatNavMenuItems(flattenNavMenuItems([...navMenuItems, record]));

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated menu item: ${record.name}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle saving a child menu item
  const handleSaveChildMenuItem = (parentId: number, record: NavMenuItemRs) => {
    // Set the parent ID on the record
    const updatedRecord = { ...record, parentNavMenuItemId: parentId };
    return handleSaveNavMenuItem(updatedRecord);
  };

  // Handle parent ID selection in form (convert 0 to null)
  const handleFormSubmit = (record: NavMenuItemRs) => {
    // If parent ID is 0, set it to null to indicate top-level
    if (record.parentNavMenuItemId === 0) {
      record.parentNavMenuItemId = null;
    }

    return handleSaveNavMenuItem(record);
  };

  // Handle deleting a nav menu item
  const handleDeleteNavMenuItem = (record: NavMenuItemRs) => {
    // We allow deleting any menu item because the architecture document mentions
    // that NavMenuItems are HARD DELETABLE (unlike most other entities)

    // Recursive function to remove an item from the hierarchy
    const removeItem = (items: NavMenuItemRs[], idToRemove: number): NavMenuItemRs[] => {
      return items.filter(item => {
        // Keep this item if it's not the one to remove
        if (item.navMenuItemId !== idToRemove) {
          // If it has children, filter them too
          if (item.childItems && item.childItems.length > 0) {
            return {
              ...item,
              childItems: removeItem(item.childItems, idToRemove),
            };
          }
          return true;
        }
        return false;
      });
    };

    // Update the nav menu items array
    setNavMenuItems(prevItems => removeItem(prevItems, record.navMenuItemId));

    // Update the flat list as well
    setFlatNavMenuItems(prevItems =>
      prevItems.filter(item => item.navMenuItemId !== record.navMenuItemId)
    );

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted menu item: ${record.name}`);
  };

  // Handle deleting a child menu item
  const handleDeleteChildMenuItem = (_parentId: number, record: NavMenuItemRs) => {
    // The parent ID is not actually needed for deletion since we're removing by ID
    return handleDeleteNavMenuItem(record);
  };

  // Always allow delete for all items - NavMenuItems are hard-deletable
  const showDeleteButton = () => true;

  // Handle adding a new nav menu item
  const handleAddNavMenuItem = () => {
    // Create a new nav menu item with default values and temporary negative ID
    const newNavMenuItem: NavMenuItemRs = {
      navMenuItemId: -Date.now(), // Temporary negative ID
      parentNavMenuItemId: null, // Top level by default
      menuKey: '',
      name: 'New Menu Item',
      slug: 'new-item',
      url: null,
      urlArgs: null,
      icon: null,
      order: 0,
      specialProcessingMethod: null,
      specialProcessingArgs: null,
      pageTitle: 'New Page',
      labId: defaultLabId,
      childItems: [],
    };

    // Add to the nav menu items array
    setNavMenuItems(prevNavMenuItems => [...prevNavMenuItems, newNavMenuItem]);

    // Update the flat list as well
    setFlatNavMenuItems(prevItems => [...prevItems, newNavMenuItem]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Handle adding a new child menu item to a parent
  const handleAddChildMenuItem = (parentId: number) => {
    // Create a new child menu item with default values and temporary negative ID
    const newChildMenuItem: NavMenuItemRs = {
      navMenuItemId: -Date.now(), // Temporary negative ID
      parentNavMenuItemId: parentId,
      menuKey: '',
      name: 'New Child Item',
      slug: 'new-child',
      url: null,
      urlArgs: null,
      icon: null,
      order: 0,
      specialProcessingMethod: null,
      specialProcessingArgs: null,
      pageTitle: 'New Child Page',
      labId: defaultLabId,
      childItems: [],
    };

    // Add the child menu item to the parent
    setNavMenuItems(prevNavMenuItems => {
      // Recursive function to add a child to a specific parent
      const addChildToParent = (items: NavMenuItemRs[]): NavMenuItemRs[] => {
        return items.map(item => {
          if (item.navMenuItemId === parentId) {
            return {
              ...item,
              childItems: [...(item.childItems || []), newChildMenuItem],
            };
          }

          if (item.childItems && item.childItems.length > 0) {
            return {
              ...item,
              childItems: addChildToParent(item.childItems),
            };
          }

          return item;
        });
      };

      return addChildToParent(prevNavMenuItems);
    });

    // Update the flat list as well
    setFlatNavMenuItems(prevItems => [...prevItems, newChildMenuItem]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all nav menu items
      const savedNavMenuItems = await configurationService.upsertNavMenuItems(navMenuItems);

      // Update local state with saved data from server
      setNavMenuItems(savedNavMenuItems);

      // Update the flat list as well
      setFlatNavMenuItems(flattenNavMenuItems(savedNavMenuItems));

      // Reset changes flag
      setHasChanges(false);

      message.success('All navigation menu items saved successfully');
    } catch (err: any) {
      console.error('Error saving navigation menu items:', err);
      message.error(`Failed to save navigation menu items: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for the nav menu items list
  const navMenuItemColumns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Menu Item'}</Text>,
      sorter: (a: NavMenuItemRs, b: NavMenuItemRs) => (a.name || '').localeCompare(b.name || ''),
      rules: [
        { required: true, message: 'Please enter the menu item name' },
        { max: 50, message: 'Name cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Tag color="blue">{text || ''}</Tag>,
      sorter: (a: NavMenuItemRs, b: NavMenuItemRs) => (a.slug || '').localeCompare(b.slug || ''),
      rules: [
        { required: true, message: 'Please enter the slug' },
        { max: 50, message: 'Slug cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Menu Key',
      dataIndex: 'menuKey',
      key: 'menuKey',
      editable: true,
      inputType: 'select',
      options:
        selectors?.navMenuKeys?.map(key => ({
          value: key.label,
          label: key.label,
        })) || [],
      inputProps: {
        showSearch: true,
        allowClear: true,
        placeholder: 'Select menu key',
      },
      render: (text: string) => text || '-',
      rules: [{ required: true, message: 'Please select a menu key' }],
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 250, message: 'URL cannot exceed 250 characters' }],
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 500, message: 'Icon cannot exceed 500 characters' }],
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      editable: true,
      inputType: 'number',
      width: 100,
      render: (order: number | null) => order ?? 0,
      sorter: (a: NavMenuItemRs, b: NavMenuItemRs) => (a.order || 0) - (b.order || 0),
      rules: [{ required: true, message: 'Please enter the display order' }],
    },
    {
      title: 'Parent',
      dataIndex: 'parentNavMenuItemId',
      key: 'parentNavMenuItemId',
      editable: true,
      inputType: 'select',
      width: 150,
      options: [
        { value: 0, label: 'None (Top Level)' }, // Using 0 as a special value to represent "no parent"
        ...flatNavMenuItems
          .filter(item => item.navMenuItemId > 0) // Only include saved items with real IDs
          .map(item => ({
            value: item.navMenuItemId,
            label: item.name || `ID: ${item.navMenuItemId}`,
          })),
      ],
      inputProps: {
        allowClear: true,
        placeholder: 'Select parent',
        // When a value comes from the database, convert null to 0 for the dropdown
        onChange: (value: string | number) => {
          // This is handled by the form
        },
      },
      render: (parentId: number | null) => {
        if (!parentId || parentId === 0) return <Tag color="green">Top Level</Tag>;
        const parentItem = flatNavMenuItems.find(item => item.navMenuItemId === parentId);
        return parentItem ? parentItem.name : `ID: ${parentId}`;
      },
    },
    {
      title: 'Children',
      dataIndex: 'childItems',
      key: 'childrenCount',
      editable: false,
      width: 120,
      render: (children: NavMenuItemRs[]) => children?.length || 0,
    },
  ];

  // Columns for child items (simplified to avoid making the table too wide)
  const getChildItemColumns = (parentId: number): EditableColumn[] => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Menu Item'}</Text>,
      rules: [
        { required: true, message: 'Please enter the menu item name' },
        { max: 50, message: 'Name cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Tag color="blue">{text || ''}</Tag>,
      rules: [
        { required: true, message: 'Please enter the slug' },
        { max: 50, message: 'Slug cannot exceed 50 characters' },
      ],
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 250, message: 'URL cannot exceed 250 characters' }],
    },
    {
      title: 'Menu Key',
      dataIndex: 'menuKey',
      key: 'menuKey',
      editable: true,
      inputType: 'select',
      options:
        selectors?.navMenuKeys?.map(key => ({
          value: key.label,
          label: key.label,
        })) || [],
      inputProps: {
        showSearch: true,
        allowClear: true,
      },
      render: (text: string) => text || '-',
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      editable: true,
      inputType: 'number',
      width: 100,
      render: (order: number | null) => order ?? 0,
      sorter: (a: NavMenuItemRs, b: NavMenuItemRs) => (a.order || 0) - (b.order || 0),
    },
    {
      title: 'Children',
      dataIndex: 'childItems',
      key: 'childrenCount',
      editable: false,
      width: 120,
      render: (children: NavMenuItemRs[]) => children?.length || 0,
    },
  ];

  // Create expandable row content for each menu item to show its children
  const expandedRowRender = (record: NavMenuItemRs) => {
    return (
      <div style={{ margin: '0 16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddChildMenuItem(record.navMenuItemId)}
          >
            Add Child Menu Item
          </Button>
        </div>

        {record.childItems && record.childItems.length > 0 ? (
          <EditableTable
            columns={getChildItemColumns(record.navMenuItemId)}
            dataSource={record.childItems}
            rowKey="navMenuItemId"
            onSave={childItem =>
              handleSaveChildMenuItem(record.navMenuItemId, childItem as NavMenuItemRs)
            }
            onDelete={childItem =>
              handleDeleteChildMenuItem(record.navMenuItemId, childItem as NavMenuItemRs)
            }
            editable={!saving}
            size="small"
            pagination={false}
            showDeleteButton={showDeleteButton}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
          />
        ) : (
          <Alert
            message="No Child Items"
            description="This menu item doesn't have any children yet."
            type="info"
            showIcon
          />
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Navigation Menu Management"
        subtitle="Manage application navigation menu structure"
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
        icon={<MenuOutlined />}
        title="Navigation Menu Items"
        extra={
          <Space>
            <Input
              placeholder="Search menu items"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNavMenuItem}
              disabled={loading || saving}
            >
              Add Menu Item
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="All Menu Items" key="all" />
          <TabPane tab="Main Menu Items" key="main" />
          <TabPane tab="Child Menu Items" key="child" />
          <TabPane tab="With URL" key="withUrl" />
          <TabPane tab="Without URL" key="withoutUrl" />
        </Tabs>

        <Spin spinning={loading || saving}>
          <EditableTable
            columns={navMenuItemColumns}
            dataSource={filteredNavMenuItems}
            rowKey="navMenuItemId"
            onSave={handleFormSubmit}
            onDelete={handleDeleteNavMenuItem}
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

export default NavMenuItemManagement;
