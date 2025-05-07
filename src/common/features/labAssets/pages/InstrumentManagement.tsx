import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Tabs, Input, Button, Space, message, Checkbox } from 'antd';
import { SearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import { stylePresets } from '../../config/theme';
import InstrumentTypesList from '../../components/instruments/InstrumentTypesList';
import InstrumentTypeDetail from '../../components/instruments/InstrumentTypeDetail';
import configurationService from '../../api/endpoints/configurationService';
import { InstrumentTypeRs, ConfigurationMaintenanceSelectors } from '../../models/types';
import appConfig from '../../config/appConfig';

const { TabPane } = Tabs;
const { Text } = Typography;

const InstrumentManagement: React.FC = () => {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedInstrumentTypeId, setSelectedInstrumentTypeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [filteredInstrumentTypes, setFilteredInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Load instrument types
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch both instrument types and selectors in parallel
        const [instrumentTypesData, selectorsData] = await Promise.all([
          configurationService.fetchInstrumentTypes(),
          configurationService.fetchSelectors(),
        ]);

        setInstrumentTypes(instrumentTypesData);
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

    // First filter by active status if not showing inactive items
    if (!showInactive) {
      filtered = filtered.filter(type => type.active !== false); // Keep both true and undefined values
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
    // Only allow deleting instrument types with negative IDs (unsaved)
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
    setFilteredInstrumentTypes(
      filteredInstrumentTypes.filter(t => t.instrumentTypeId !== instrumentTypeId)
    );

    message.success('Instrument type deleted successfully');
  };

  // Handle creating a new instrument type
  const handleAddInstrumentType = () => {
    // Create a new instrument type with default values
    const newInstrumentType: InstrumentTypeRs = {
      instrumentTypeId: -Date.now(), // Temporary negative ID
      name: '',
      measurementType: '',
      dataFolder: '',
      peakAreaSaturationThreshold: null,
      instrumentFileParser: null,
      active: true, // New entries are active by default
      labId: appConfig.api.defaultLabId, // Explicitly set the labId from config
      instrumentRss: [],
      instrumentTypeAnalyteRss: [],
    };

    // Add to the array of instrument types
    setInstrumentTypes([...instrumentTypes, newInstrumentType]);
    setFilteredInstrumentTypes([...filteredInstrumentTypes, newInstrumentType]);

    // Select the new instrument type for editing
    setSelectedInstrumentTypeId(newInstrumentType.instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle updating an instrument type - this now saves to the server
  const handleUpdateInstrumentType = async (instrumentType: InstrumentTypeRs) => {
    try {
      setSaving(true);

      // Create a copy of our instrument types with the updated one
      const updatedInstrumentTypes = instrumentTypes.map(t =>
        t.instrumentTypeId === instrumentType.instrumentTypeId ? instrumentType : t
      );

      // If it's a new record (negative ID), save it separately
      if (instrumentType.instrumentTypeId < 0) {
        // For new records, we just update local state and will save later
        setInstrumentTypes(updatedInstrumentTypes);

        // Update the filtered list too
        setFilteredInstrumentTypes(prev =>
          prev.map(t =>
            t.instrumentTypeId === instrumentType.instrumentTypeId ? instrumentType : t
          )
        );

        message.success(`Instrument type "${instrumentType.name}" created successfully`);
      } else {
        // For existing records, send to the server
        // Find the instrument type to update
        const typeToUpdate = updatedInstrumentTypes.find(
          t => t.instrumentTypeId === instrumentType.instrumentTypeId
        );

        if (!typeToUpdate) {
          throw new Error(`Instrument type with ID ${instrumentType.instrumentTypeId} not found`);
        }

        // Ensure the labId is set correctly
        const typeToSave = {
          ...typeToUpdate,
          labId: appConfig.api.defaultLabId, // Use the labId from config
        };

        // Save to the server - wrapping in an array as the API expects an array
        const savedTypes = await configurationService.upsertInstrumentTypes([typeToSave]);

        if (savedTypes && savedTypes.length > 0) {
          // Replace the updated item with the saved version from the server
          const savedType = savedTypes[0];

          // Update the main instrument types array
          setInstrumentTypes(prev =>
            prev.map(t => (t.instrumentTypeId === savedType.instrumentTypeId ? savedType : t))
          );

          // Update the filtered list too if it contains this item
          if (
            filteredInstrumentTypes.some(t => t.instrumentTypeId === savedType.instrumentTypeId)
          ) {
            setFilteredInstrumentTypes(prev =>
              prev.map(t => (t.instrumentTypeId === savedType.instrumentTypeId ? savedType : t))
            );
          }

          message.success(`Instrument type "${savedType.name}" updated successfully`);
        }
      }
    } catch (err: any) {
      message.error(`Failed to save instrument type: ${err.message}`);
      console.error('Error saving instrument type:', err);
    } finally {
      setSaving(false);
    }
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

  // Define the extra content for the card section - search and add button
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
    </Space>
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> Instrument Types
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
