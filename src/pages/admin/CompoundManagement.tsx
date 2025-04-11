import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Button, Input, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined, ExperimentOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';
import { stylePresets } from '../../config/theme';
import configurationService from '../../api/endpoints/configurationService';
import { CompoundRs } from '../../models/types';

const { Text } = Typography;

const CompoundManagement: React.FC = () => {
  const [compounds, setCompounds] = useState<CompoundRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCompounds, setFilteredCompounds] = useState<CompoundRs[]>([]);

  // Load compounds
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const compoundsData = await configurationService.fetchCompounds();
        setCompounds(compoundsData);
        setFilteredCompounds(compoundsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load compounds');
        message.error('Failed to load compounds');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter compounds based on search text
  useEffect(() => {
    if (!compounds.length) return;

    if (!searchText) {
      setFilteredCompounds(compounds);
      return;
    }

    const filtered = compounds.filter(
      compound =>
        compound.name.toLowerCase().includes(searchText.toLowerCase()) ||
        compound.cas.toLowerCase().includes(searchText.toLowerCase()) ||
        (compound.ccCompoundName &&
          compound.ccCompoundName.toLowerCase().includes(searchText.toLowerCase()))
    );

    setFilteredCompounds(filtered);
  }, [searchText, compounds]);

  // Handle saving a compound
  const handleSaveCompound = (record: CompoundRs) => {
    // Simulate async operation
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success(`Updated Compound: ${record.name}`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = record.analyteId < 0;
        const updatedRecord = isNew
          ? { ...record, analyteId: Math.floor(Math.random() * 1000) + 100 }
          : record;

        // Update the local state
        setCompounds(prevCompounds => {
          if (isNew) {
            // Replace the temp record with the "saved" one
            return [...prevCompounds.filter(c => c.analyteId !== record.analyteId), updatedRecord];
          } else {
            // Update existing record
            return prevCompounds.map(c => (c.analyteId === record.analyteId ? updatedRecord : c));
          }
        });

        // Make sure the filtered list is updated too
        setFilteredCompounds(prevFiltered => {
          if (isNew) {
            return [...prevFiltered.filter(c => c.analyteId !== record.analyteId), updatedRecord];
          } else {
            return prevFiltered.map(c => (c.analyteId === record.analyteId ? updatedRecord : c));
          }
        });

        resolve();
      }, 500); // Simulate network delay
    });
  };

  // Handle deleting a compound
  const handleDeleteCompound = (record: CompoundRs) => {
    // Here you would call the delete API
    message.success(`Deleted Compound: ${record.name}`);

    // Update local state to reflect the deletion
    setCompounds(prevCompounds => prevCompounds.filter(c => c.analyteId !== record.analyteId));
    setFilteredCompounds(prevFiltered =>
      prevFiltered.filter(c => c.analyteId !== record.analyteId)
    );
  };

  // Handle adding a new compound
  const handleAddCompound = () => {
    // Create a new compound with default values
    const newCompound: CompoundRs = {
      analyteId: -Date.now(), // Temporary negative ID
      cas: '',
      name: '',
      ccCompoundName: '',
    };

    // Add to the beginning of the array
    setCompounds([newCompound, ...compounds]);
    setFilteredCompounds([newCompound, ...filteredCompounds]);
  };

  // Table columns for the compounds list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Compound'}</Text>,
      sorter: (a: CompoundRs, b: CompoundRs) => a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the compound name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'CAS Number',
      dataIndex: 'cas',
      key: 'cas',
      editable: true,
      inputType: 'text',
      sorter: (a: CompoundRs, b: CompoundRs) => a.cas.localeCompare(b.cas),
      rules: [
        { required: true, message: 'Please enter the CAS number' },
        { max: 50, message: 'CAS number cannot exceed 50 characters' },
        {
          pattern: /^[0-9]{1,7}-[0-9]{2}-[0-9]$/,
          message: 'CAS number must be in the format XXXXXXX-XX-X',
        },
      ],
    },
    {
      title: 'CC Compound Name',
      dataIndex: 'ccCompoundName',
      key: 'ccCompoundName',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [{ max: 150, message: 'CC compound name cannot exceed 150 characters' }],
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Compound Management"
        subtitle="Manage compounds used in laboratory analysis"
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

      <CardSection
        icon={<ExperimentOutlined />}
        title="Compounds"
        extra={
          <Space>
            <Input
              placeholder="Search compounds"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Spin spinning={loading}>
          <EditableTable
            columns={columns}
            dataSource={filteredCompounds}
            rowKey="analyteId"
            onSave={handleSaveCompound}
            onDelete={handleDeleteCompound}
            onAdd={handleAddCompound}
            editable={true}
            size="small"
            addButtonText="Add Compound"
          />
        </Spin>
      </CardSection>
    </div>
  );
};

export default CompoundManagement;
