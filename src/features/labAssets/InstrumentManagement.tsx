import React, { useState, useEffect, useCallback } from 'react';

import { SearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Tabs, Input, Button, Space, message, Checkbox } from 'antd';

import appConfig from '../../config/appConfig';
import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import useBeforeUnloadProtection from '../../hooks/useBeforeUnloadProtection';
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

  // Simple high-level change detection - compare the entire graph
  const hasChanges = JSON.stringify(originalInstrumentTypes) !== JSON.stringify(instrumentTypes);

  // Debug change detection
  useEffect(() => {
    console.log('🔍 Change detection:', {
      hasChanges,
      originalCount: originalInstrumentTypes.length,
      currentCount: instrumentTypes.length,
    });
  }, [hasChanges, originalInstrumentTypes.length, instrumentTypes.length]);

  // Save function
  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);

      const itemsToSave = instrumentTypes.filter(item => {
        if (item.instrumentTypeId < 0) return true;

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

      const savedItems = await upsertInstrumentTypes(itemsToSave);

      let updatedTypes = [...instrumentTypes];

      savedItems.forEach(savedItem => {
        const index = updatedTypes.findIndex(
          item =>
            item.instrumentTypeId === savedItem.instrumentTypeId ||
            (item.instrumentTypeId < 0 && item.name === savedItem.name)
        );

        if (index >= 0) {
          updatedTypes[index] = savedItem;
        }
      });

      setInstrumentTypes(updatedTypes);
      setOriginalInstrumentTypes(JSON.parse(JSON.stringify(updatedTypes)));

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

  // BeforeUnload protection - this will catch most navigation scenarios
  useBeforeUnloadProtection({
    enabled: hasChanges,
    message: 'You have unsaved changes in Instrument Management. Are you sure you want to leave?',
    onBeforeUnload: () => {
      console.log('⚠️ User attempting to leave with unsaved changes in Instrument Management');
      // You could attempt an auto-save here if desired
      // saveAllChanges();
    },
  });

  // Load instrument types
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [instrumentTypesData, selectorsData] = await Promise.all([
          fetchInstrumentTypes(),
          fetchSelectors(),
        ]);

        console.log('📊 Loaded data:', {
          instrumentTypesCount: instrumentTypesData.length,
          hasSelectors: !!selectorsData,
        });

        setInstrumentTypes(instrumentTypesData);
        setOriginalInstrumentTypes(JSON.parse(JSON.stringify(instrumentTypesData)));
        setFilteredInstrumentTypes(instrumentTypesData);
        setSelectors(selectorsData);
        setError(null);
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

    if (!showInactive) {
      filtered = filtered.filter(type => type.active !== false);
    }

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

    if (instrumentType?.instrumentRss && instrumentType.instrumentRss.length > 0) {
      message.error('Cannot delete instrument type with associated instruments');
      return;
    }

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
      instrumentTypeId: -Date.now(),
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

    setSelectedInstrumentTypeId(newInstrumentType.instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle updating an instrument type
  const handleUpdateInstrumentType = (updatedInstrumentType: InstrumentTypeRs) => {
    console.log('🔄 handleUpdateInstrumentType called:', {
      id: updatedInstrumentType.instrumentTypeId,
      name: updatedInstrumentType.name,
      instrumentCount: updatedInstrumentType.instrumentRss?.length,
      analyteCount: updatedInstrumentType.instrumentTypeAnalyteRss?.length,
    });

    const updatedInstrumentTypes = instrumentTypes.map(t =>
      t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
    );

    setInstrumentTypes(updatedInstrumentTypes);

    setFilteredInstrumentTypes(prev =>
      prev.map(t =>
        t.instrumentTypeId === updatedInstrumentType.instrumentTypeId ? updatedInstrumentType : t
      )
    );

    console.log('✅ State updated, change detection should trigger');
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
