import React, { useState, useEffect, useCallback } from 'react';

import { SearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Tabs, Input, Button, Space, message, Checkbox } from 'antd';

import appConfig from '../../config/appConfig';
import { useUnsavedChanges } from '../../contexts/NavigationProtectionContext';
import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import CardSection from '../shared/components/CardSection';
import PageHeader from '../shared/components/PageHeader';
import { fetchSelectors } from '../shared/sharedService';

import InstrumentTypeDetail from './InstrumentTypeDetail';
import InstrumentTypesList from './InstrumentTypesList';
import { fetchInstrumentTypes, upsertInstrumentTypes } from './labAssetService';
import { InstrumentTypeRs } from './types';

const { TabPane } = Tabs;
const { Text } = Typography;

const InstrumentManagement: React.FC = () => {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [originalInstrumentTypes, setOriginalInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedInstrumentTypeId, setSelectedInstrumentTypeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [filteredInstrumentTypes, setFilteredInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Change detection - properly compare original vs current data
  const hasChanges = JSON.stringify(originalInstrumentTypes) !== JSON.stringify(instrumentTypes);

  // Debug change detection
  useEffect(() => {
    console.log('🔍 Change detection debug:', {
      originalCount: originalInstrumentTypes.length,
      currentCount: instrumentTypes.length,
      hasChanges,
      originalFirstItem: originalInstrumentTypes[0]?.name,
      currentFirstItem: instrumentTypes[0]?.name,
      // Show first few characters of stringified data for comparison
      originalHash: JSON.stringify(originalInstrumentTypes).substring(0, 100),
      currentHash: JSON.stringify(instrumentTypes).substring(0, 100),
    });
  }, [originalInstrumentTypes, instrumentTypes, hasChanges]);

  // Save function for navigation protection
  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);

      // Filter out only the items that need saving (new items with negative IDs or changed items)
      const itemsToSave = instrumentTypes.filter(item => {
        // New items (negative IDs) or changed items
        if (item.instrumentTypeId < 0) return true;

        // Find corresponding original item
        const originalItem = originalInstrumentTypes.find(
          orig => orig.instrumentTypeId === item.instrumentTypeId
        );
        return originalItem && JSON.stringify(originalItem) !== JSON.stringify(item);
      });

      if (itemsToSave.length === 0) {
        message.info('No changes to save');
        return true;
      }

      console.log(
        '💾 Saving changes for items:',
        itemsToSave.map(i => ({ id: i.instrumentTypeId, name: i.name }))
      );

      // Save to server
      const savedItems = await upsertInstrumentTypes(itemsToSave);

      // Update the current data with saved results
      let updatedTypes = [...instrumentTypes];

      savedItems.forEach(savedItem => {
        const index = updatedTypes.findIndex(
          item =>
            item.instrumentTypeId === savedItem.instrumentTypeId ||
            (item.instrumentTypeId < 0 && item.name === savedItem.name) // Handle new items getting real IDs
        );

        if (index >= 0) {
          updatedTypes[index] = savedItem;
        }
      });

      setInstrumentTypes(updatedTypes);
      setOriginalInstrumentTypes(updatedTypes);

      message.success(`Successfully saved ${savedItems.length} instrument type(s)`);
      return true;
    } catch (error: any) {
      console.error('Save failed:', error);
      message.error(`Failed to save changes: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  }, [instrumentTypes, originalInstrumentTypes]);

  // Register unsaved changes with navigation protection
  useUnsavedChanges(hasChanges, saveAllChanges, 'InstrumentManagement');

  // Load instrument types
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch both instrument types and selectors in parallel
        const [instrumentTypesData, selectorsData] = await Promise.all([
          fetchInstrumentTypes(),
          fetchSelectors(),
        ]);

        console.log('📊 Loaded data:', {
          instrumentTypesCount: instrumentTypesData.length,
          hasSelectors: !!selectorsData,
        });

        // Create a proper deep copy for comparison
        const deepCopy = JSON.parse(JSON.stringify(instrumentTypesData));

        setInstrumentTypes(instrumentTypesData);
        setOriginalInstrumentTypes(deepCopy);
        setFilteredInstrumentTypes(instrumentTypesData);
        setSelectors(selectorsData);
        setError(null);

        console.log('📊 Data loaded and states set:', {
          instrumentTypesSet: instrumentTypesData.length,
          originalSet: deepCopy.length,
          areEqual: JSON.stringify(instrumentTypesData) === JSON.stringify(deepCopy),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load instrument types');
        message.error('Failed to load instrument types');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter instrument types based on search text and active status
  useEffect(() => {
    if (!instrumentTypes.length) return;

    let filtered = [...instrumentTypes];

    // First filter by active status if not showing inactive items
    if (!showInactive) {
      filtered = filtered.filter(type => type.active !== false);
    }

    // Then filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        type =>
          type.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          type.measurementType?.toLowerCase().includes(searchText.toLowerCase()) ||
          type.dataFolder?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredInstrumentTypes(filtered);
  }, [searchText, instrumentTypes, showInactive]);

  // Handle selecting an instrument type
  const handleSelectInstrumentType = (instrumentTypeId: number) => {
    setSelectedInstrumentTypeId(instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle deleting an instrument type
  const handleDeleteInstrumentType = (instrumentTypeId: number) => {
    const instrumentType = instrumentTypes.find(t => t.instrumentTypeId === instrumentTypeId);

    if (!instrumentType) {
      message.error('Instrument type not found');
      return;
    }

    if (instrumentTypeId >= 0) {
      message.error('Cannot delete existing instrument type. Set it to inactive instead.');
      return;
    }

    // Check if the instrument type has instruments
    if (instrumentType?.instrumentRss && instrumentType.instrumentRss.length > 0) {
      message.error('Cannot delete instrument type with associated instruments');
      return;
    }

    // Update the state to remove the deleted instrument type
    const updatedInstrumentTypes = instrumentTypes.filter(
      t => t.instrumentTypeId !== instrumentTypeId
    );
    setInstrumentTypes(updatedInstrumentTypes);
    setFilteredInstrumentTypes(prev => prev.filter(t => t.instrumentTypeId !== instrumentTypeId));

    message.success('Instrument type deleted successfully');
  };

  // Handle creating a new instrument type
  const handleAddInstrumentType = () => {
    const newInstrumentType: InstrumentTypeRs = {
      instrumentTypeId: -Date.now(), // Temporary negative ID
      name: '',
      measurementType: '',
      dataFolder: '',
      peakAreaSaturationThreshold: null,
      instrumentFileParser: null,
      active: true,
      labId: appConfig.api.defaultLabId,
      instrumentRss: [],
      instrumentTypeAnalyteRss: [],
    };

    console.log('➕ Adding new instrument type with ID:', newInstrumentType.instrumentTypeId);

    setInstrumentTypes(prev => [...prev, newInstrumentType]);
    setFilteredInstrumentTypes(prev => [...prev, newInstrumentType]);

    // Select the new instrument type for editing
    setSelectedInstrumentTypeId(newInstrumentType.instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle updating an instrument type (for saves)
  const handleUpdateInstrumentType = async (updatedInstrumentType: InstrumentTypeRs) => {
    console.log('💾 Saving instrument type:', {
      id: updatedInstrumentType.instrumentTypeId,
      name: updatedInstrumentType.name,
    });

    // Update the local state immediately for better UX
    const updatedInstrumentTypes = instrumentTypes.map(t =>
      t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
    );

    setInstrumentTypes(updatedInstrumentTypes);

    // Update filtered list if the item is visible
    setFilteredInstrumentTypes(prev =>
      prev.map(t =>
        t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
      )
    );

    message.success(`Instrument type "${updatedInstrumentType.name || 'New Type'}" saved locally`);
  };

  // Handle real-time changes to an instrument type (for change detection)
  const handleInstrumentTypeChange = (updatedInstrumentType: InstrumentTypeRs) => {
    console.log('📝 Real-time change to instrument type:', {
      id: updatedInstrumentType.instrumentTypeId,
      name: updatedInstrumentType.name,
    });

    // Update the local state for change detection
    const updatedInstrumentTypes = instrumentTypes.map(t =>
      t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
    );

    setInstrumentTypes(updatedInstrumentTypes);

    // Update filtered list if the item is visible
    setFilteredInstrumentTypes(prev =>
      prev.map(t =>
        t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
      )
    );
  };

  // Get the currently selected instrument type
  const selectedInstrumentType = instrumentTypes.find(
    t => t.instrumentTypeId === selectedInstrumentTypeId
  );

  // Handle back button click in detail view
  const handleBackToList = () => {
    setSelectedInstrumentTypeId(null);
    setActiveTab('list');
  };

  // Handle toggling inactive items
  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
  };

  // Define the extra content for the card section
  const listActionsExtra = (
    <Space>
      <Input
        placeholder="Search instruments"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{ width: 250 }}
        allowClear
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInstrumentType}>
        Add Instrument Type
      </Button>
      {hasChanges && (
        <Button
          type="primary"
          onClick={saveAllChanges}
          loading={saving}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        >
          Save All Changes
        </Button>
      )}
      {/* Debug button to test change detection */}
      <Button
        type="dashed"
        onClick={() => {
          if (instrumentTypes.length > 0) {
            const updated = [...instrumentTypes];
            updated[0] = { ...updated[0], name: (updated[0].name || 'Test') + ' Modified' };
            setInstrumentTypes(updated);
            console.log('🧪 Manual change applied for testing');
          }
        }}
      >
        Test Change
      </Button>
    </Space>
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
        extra={
          hasChanges ? (
            <div
              style={{
                padding: '8px 16px',
                background: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '4px',
              }}
            >
              <Text type="warning">⚠️ You have unsaved changes</Text>
            </div>
          ) : null
        }
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> Instrument Types
              {hasChanges && <span style={{ color: '#faad14' }}> *</span>}
            </span>
          }
          key="list"
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <CardSection
            title="Instrument Types"
            extra={listActionsExtra}
            style={{ marginBottom: 16 }}
          >
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Checkbox
                checked={showInactive}
                onChange={e => handleShowInactiveChange(e.target.checked)}
              >
                Show Inactive
              </Checkbox>
            </div>

            <Spin spinning={loading}>
              <InstrumentTypesList
                instrumentTypes={filteredInstrumentTypes}
                onSelectInstrumentType={handleSelectInstrumentType}
                onDeleteInstrumentType={handleDeleteInstrumentType}
                showInactive={showInactive}
              />
            </Spin>
          </CardSection>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined /> Instrument Type Details
              {hasChanges && <span style={{ color: '#faad14' }}> *</span>}
            </span>
          }
          key="detail"
          disabled={!selectedInstrumentTypeId}
        >
          {selectedInstrumentType && selectors ? (
            <InstrumentTypeDetail
              instrumentType={selectedInstrumentType}
              selectors={selectors}
              onUpdate={handleUpdateInstrumentType}
              onChange={handleInstrumentTypeChange} // Add real-time change handler
              onBack={handleBackToList}
              showInactive={showInactive}
              onShowInactiveChange={handleShowInactiveChange}
              saving={saving}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin spinning={loading} />
              {!loading && (
                <Text>No instrument type selected. Please select one from the list.</Text>
              )}
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default InstrumentManagement;
