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
  ConfigurationMaintenanceSelectors, // Updated from SopMaintenanceSelectors
  InstrumentFileParserType,
} from '../../models/types';
import { fetchSelectors } from '../../api/endpoints/configurationService'; // Updated from sopService

const { TabPane } = Tabs;
const { Text } = Typography;

const InstrumentManagement: React.FC = () => {
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentTypeRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null); // Updated type
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
          fetchSelectors(), // Updated function from configurationService
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

  // The rest of the component stays the same
  // ...

  return (
    <div className="page-container">
      <PageHeader
        title="Instrument Management"
        subtitle="Manage instrument types and instruments used in the laboratory"
      />

      {/* Rest of the component JSX stays the same */}
    </div>
  );
};

export default InstrumentManagement;
