import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Tabs, Input, Button, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import { stylePresets } from '../../config/theme';
import InstrumentTypesList from '../../components/instruments/InstrumentTypesList';
import InstrumentTypeDetail from '../../components/instruments/InstrumentTypeDetail';
import { fetchInstrumentTypes } from '../../api/endpoints/instrumentService';
import {
  InstrumentTypeRs,
  SopMaintenanceSelectors,
  InstrumentFileParserType,
} from '../../models/types';
import { fetchSelectors } from '../../api/endpoints/sopService';

const { TabPane } = Tabs;
const { Text } = Typography;

const InstrumentManagement: React.FC = () => {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [selectors, setSelectors] = useState<SopMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedInstrumentTypeId, setSelectedInstrumentTypeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');

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

        setInstrumentTypes(instrumentTypesData);
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

  // Handle instrument type selection
  const handleSelectInstrumentType = (instrumentTypeId: number) => {
    setSelectedInstrumentTypeId(instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle adding a new instrument type
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

    // Add to the beginning of the array
    setInstrumentTypes([newInstrumentType, ...instrumentTypes]);

    // Select the new instrument type
    setSelectedInstrumentTypeId(newInstrumentType.instrumentTypeId);
    setActiveTab('detail');
  };

  // Handle instrument type updates
  const handleUpdateInstrumentType = (updatedType: InstrumentTypeRs) => {
    setInstrumentTypes(prev =>
      prev.map(type =>
        type.instrumentTypeId === updatedType.instrumentTypeId ? updatedType : type
      )
    );
    message.success(`Instrument type "${updatedType.name}" updated successfully`);
  };

  // Handle instrument type deletion
  const handleDeleteInstrumentType = (instrumentTypeId: number) => {
    setInstrumentTypes(prev => prev.filter(type => type.instrumentTypeId !== instrumentTypeId));

    if (selectedInstrumentTypeId === instrumentTypeId) {
      setSelectedInstrumentTypeId(null);
      setActiveTab('list');
    }

    message.success('Instrument type deleted successfully');
  };

  // Filter instrument types based on search text
  const filteredInstrumentTypes = instrumentTypes.filter(
    type =>
      type.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      type.measurementType?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get the selected instrument type
  const selectedInstrumentType = instrumentTypes.find(
    type => type.instrumentTypeId === selectedInstrumentTypeId
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> Instrument Types
            </span>
          }
          key="list"
        >
          <CardSection
            title="Instrument Types"
            extra={
              <Space>
                <Input
                  placeholder="Search instrument types"
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
            }
            style={stylePresets.contentCard}
          >
            <Spin spinning={loading}>
              {instrumentTypes.length === 0 && !loading ? (
                <Alert
                  message="No Instrument Types"
                  description="No instrument types have been added yet. Click 'Add Instrument Type' to create one."
                  type="info"
                  showIcon
                />
              ) : (
                <InstrumentTypesList
                  instrumentTypes={filteredInstrumentTypes}
                  onSelectInstrumentType={handleSelectInstrumentType}
                  onDeleteInstrumentType={handleDeleteInstrumentType}
                />
              )}
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
          disabled={!selectedInstrumentType}
        >
          {selectedInstrumentType && selectors && (
            <InstrumentTypeDetail
              instrumentType={selectedInstrumentType}
              selectors={selectors}
              onUpdate={handleUpdateInstrumentType}
              onBack={() => setActiveTab('list')}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default InstrumentManagement;
