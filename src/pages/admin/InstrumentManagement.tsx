import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Tabs, Input, Button, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import { stylePresets } from '../../config/theme';
import InstrumentTypesList from '../../components/instruments/InstrumentTypesList';
import InstrumentTypeDetail from '../../components/instruments/InstrumentTypeDetail';
import configurationService from '../../api/endpoints/configurationService';
import {
  InstrumentTypeRs,
  ConfigurationMaintenanceSelectors,
  InstrumentFileParserType,
} from '../../models/types';

const { TabPane } = Tabs;
const { Text } = Typography;

const InstrumentManagement: React.FC = () => {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedInstrumentTypeId, setSelectedInstrumentTypeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [filteredInstrumentTypes, setFilteredInstrumentTypes] = useState<InstrumentTypeRs[]>([]);

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

  // Filter instrument types based on search text
  useEffect(() => {
    if (!instrumentTypes.length) return;

    if (!searchText) {
      setFilteredInstrumentTypes(instrumentTypes);
      return;
    }

    const filtered = instrumentTypes.filter(
      type =>
        type.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        type.measurementType?.toLowerCase().includes(searchText.toLowerCase()) ||
        type.dataFolder?.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredInstrumentTypes(filtered);
  }, [searchText, instrumentTypes]);

  // Handle selecting an instrument type
  const handleSelectInstrumentType = (instrumentTypeId: number) => {
    setSelectedInstrumentTypeId(instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle deleting an instrument type
  const handleDeleteInstrumentType = (instrumentTypeId: number) => {
    // Check if the instrument type has instruments
    const instrumentType = instrumentTypes.find(t => t.instrumentTypeId === instrumentTypeId);
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

  // Handle updating an instrument type
  const handleUpdateInstrumentType = (instrumentType: InstrumentTypeRs) => {
    // Update the instrument type in the state
    const updatedInstrumentTypes = instrumentTypes.map(t =>
      t.instrumentTypeId === instrumentType.instrumentTypeId ? instrumentType : t
    );
    setInstrumentTypes(updatedInstrumentTypes);
    setFilteredInstrumentTypes(
      filteredInstrumentTypes.map(t =>
        t.instrumentTypeId === instrumentType.instrumentTypeId ? instrumentType : t
      )
    );

    message.success(`Instrument type "${instrumentType.name}" updated successfully`);
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

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          activeTab === 'list' ? (
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
          ) : null
        }
      >
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

          <Spin spinning={loading}>
            <InstrumentTypesList
              instrumentTypes={filteredInstrumentTypes}
              onSelectInstrumentType={handleSelectInstrumentType}
              onDeleteInstrumentType={handleDeleteInstrumentType}
            />
          </Spin>
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
