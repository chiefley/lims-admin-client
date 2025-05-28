import React, { useState, useEffect, useCallback } from 'react';

import {
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
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

interface TabValidationError {
  tabKey: string;
  hasErrors: boolean;
  errorMessage?: string;
}

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

  // Page-level edit mode state
  const [editMode, setEditMode] = useState<boolean>(false);
  const [tabValidationErrors, setTabValidationErrors] = useState<TabValidationError[]>([]);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);

  // Enhanced change detection: Edit mode OR actual data changes
  const hasDataChanges =
    JSON.stringify(originalInstrumentTypes) !== JSON.stringify(instrumentTypes);
  const hasUnsavedChanges = editMode || hasDataChanges;

  // Save function
  const saveAllChanges = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);

      // Page-level validation before save
      const pageValidationErrors = validateEntireConfiguration();
      if (pageValidationErrors.length > 0) {
        message.error(`Cannot save: ${pageValidationErrors.join(', ')}`);
        return false;
      }

      const itemsToSave = instrumentTypes.filter(item => {
        if (item.instrumentTypeId < 0) return true;

        const originalItem = originalInstrumentTypes.find(
          orig => orig.instrumentTypeId === item.instrumentTypeId
        );
        return originalItem && JSON.stringify(originalItem) !== JSON.stringify(item);
      });

      if (itemsToSave.length === 0 && !editMode) {
        message.info('No changes to save');
        return true;
      }

      console.log(
        '💾 Saving changes for items:',
        itemsToSave.map(i => ({ id: i.instrumentTypeId, name: i.name }))
      );

      let savedItems: InstrumentTypeRs[] = [];

      if (itemsToSave.length > 0) {
        savedItems = await upsertInstrumentTypes(itemsToSave);
      }

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
      setEditMode(false); // Exit edit mode
      setTabValidationErrors([]); // Clear validation errors

      message.success(
        itemsToSave.length > 0
          ? `Successfully saved ${savedItems.length} instrument type(s)`
          : 'Configuration saved successfully'
      );
      return true;
    } catch (error: any) {
      console.error('Save failed:', error);
      message.error(`Failed to save changes: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  }, [instrumentTypes, originalInstrumentTypes, editMode]);

  // Register for navigation protection
  useUnsavedChanges(hasUnsavedChanges, saveAllChanges, 'InstrumentManagement');

  // Debug change detection
  useEffect(() => {
    console.log('🔍 Change detection:', {
      editMode,
      hasDataChanges,
      hasUnsavedChanges,
      originalCount: originalInstrumentTypes.length,
      currentCount: instrumentTypes.length,
    });
  }, [
    editMode,
    hasDataChanges,
    hasUnsavedChanges,
    originalInstrumentTypes.length,
    instrumentTypes.length,
  ]);

  // Page-level validation function
  const validateEntireConfiguration = (): string[] => {
    const errors: string[] = [];

    instrumentTypes.forEach((instrumentType, index) => {
      // Basic validation
      if (!instrumentType.name?.trim()) {
        errors.push(`Instrument Type #${index + 1}: Name is required`);
      }
      if (!instrumentType.measurementType?.trim()) {
        errors.push(
          `${instrumentType.name || `Instrument Type #${index + 1}`}: Measurement Type is required`
        );
      }
      if (!instrumentType.dataFolder?.trim()) {
        errors.push(
          `${instrumentType.name || `Instrument Type #${index + 1}`}: Data Folder is required`
        );
      }
      if (!instrumentType.instrumentFileParser) {
        errors.push(
          `${instrumentType.name || `Instrument Type #${index + 1}`}: File Parser Type is required`
        );
      }

      // Cross-tab validation
      instrumentType.instrumentRss?.forEach((instrument, instIndex) => {
        if (!instrument.name?.trim()) {
          errors.push(`${instrumentType.name}: Instrument #${instIndex + 1} name is required`);
        }
      });

      instrumentType.instrumentTypeAnalyteRss?.forEach((analyte, anaIndex) => {
        if (!analyte.analyteId) {
          errors.push(`${instrumentType.name}: Analyte #${anaIndex + 1} selection is required`);
        }
        if (!analyte.analyteAlias?.trim()) {
          errors.push(`${instrumentType.name}: Analyte #${anaIndex + 1} alias is required`);
        }
      });
    });

    return errors;
  };

  // Tab validation function
  const validateTab = (instrumentType: InstrumentTypeRs, tabKey: string): TabValidationError => {
    const errors: string[] = [];

    switch (tabKey) {
      case 'basic':
        if (!instrumentType.name?.trim()) errors.push('Name is required');
        if (!instrumentType.measurementType?.trim()) errors.push('Measurement Type is required');
        if (!instrumentType.dataFolder?.trim()) errors.push('Data Folder is required');
        if (!instrumentType.instrumentFileParser) errors.push('File Parser Type is required');
        break;

      case 'instruments':
        instrumentType.instrumentRss?.forEach((instrument, index) => {
          if (!instrument.name?.trim()) {
            errors.push(`Instrument #${index + 1} name is required`);
          }
        });
        break;

      case 'analytes':
        instrumentType.instrumentTypeAnalyteRss?.forEach((analyte, index) => {
          if (!analyte.analyteId) {
            errors.push(`Analyte #${index + 1} selection is required`);
          }
          if (!analyte.analyteAlias?.trim()) {
            errors.push(`Analyte #${index + 1} alias is required`);
          }
        });
        break;
    }

    return {
      tabKey,
      hasErrors: errors.length > 0,
      errorMessage: errors.length > 0 ? errors.join(', ') : undefined,
    };
  };

  // Handle tab switching with validation
  const handleTabChange = (newTabKey: string) => {
    if (!editMode) {
      setActiveTab(newTabKey);
      return;
    }

    // If we're in detail view and switching tabs, validate current tab
    if (activeTab === 'detail' && selectedInstrumentTypeId) {
      const selectedInstrumentType = instrumentTypes.find(
        t => t.instrumentTypeId === selectedInstrumentTypeId
      );

      if (selectedInstrumentType) {
        // We need the current tab within the detail view, not the top-level tab
        // For now, allow switching and handle validation at save time
        setActiveTab(newTabKey);
        return;
      }
    }

    setActiveTab(newTabKey);
  };

  // Handle entering edit mode
  const handleStartEdit = () => {
    console.log('📝 Entering edit mode');
    setEditMode(true);
    setTabValidationErrors([]);
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    console.log('❌ Canceling edit mode');
    // Restore original data
    setInstrumentTypes(JSON.parse(JSON.stringify(originalInstrumentTypes)));
    setEditMode(false);
    setTabValidationErrors([]);
    message.info('Changes discarded');
  };

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
    if (!editMode) {
      message.warning('Enter edit mode to delete instrument types');
      return;
    }

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
    if (!editMode) {
      message.warning('Enter edit mode to add new instrument types');
      return;
    }

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

  // Render edit mode controls
  const renderEditModeControls = () => {
    if (editMode) {
      return (
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={saveAllChanges}
            loading={saving}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Save All Changes
          </Button>
          <Button icon={<CloseOutlined />} onClick={handleCancelEdit} disabled={saving}>
            Cancel
          </Button>
        </Space>
      );
    }

    return (
      <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit}>
        Edit
      </Button>
    );
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
        disabled={saving}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddInstrumentType}
        disabled={!editMode}
      >
        Add Instrument Type
      </Button>
      {renderEditModeControls()}
    </Space>
  );

  // Get tab status indicator
  const getTabStatus = (tabKey: string) => {
    if (!editMode) return null;

    const tabError = tabValidationErrors.find(e => e.tabKey === tabKey);
    if (tabError?.hasErrors) {
      return <span style={{ color: '#ff4d4f' }}>❌</span>;
    }
    return null;
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
        extra={
          hasUnsavedChanges ? (
            <div
              style={{
                padding: '8px 16px',
                background: editMode ? '#fff7e6' : '#fffbe6',
                border: `1px solid ${editMode ? '#ffd591' : '#ffe58f'}`,
                borderRadius: '4px',
              }}
            >
              <Text type="warning">
                {editMode ? '✏️ Edit Mode Active' : '⚠️ You have unsaved changes'}
              </Text>
            </div>
          ) : null
        }
      />

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> Instrument Types
              {getTabStatus('list')}
              {hasUnsavedChanges && <span style={{ color: '#faad14' }}>*</span>}
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
              {getTabStatus('detail')}
              {hasUnsavedChanges && <span style={{ color: '#faad14' }}>*</span>}
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
              editMode={editMode}
              onValidationChange={(tabKey, hasErrors, errorMessage) => {
                setTabValidationErrors(prev => [
                  ...prev.filter(e => e.tabKey !== tabKey),
                  { tabKey, hasErrors, errorMessage },
                ]);
              }}
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
