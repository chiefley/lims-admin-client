import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert, Button, Input, Space, message } from 'antd';
import { SearchOutlined, PlusOutlined, ExperimentOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';
import { stylePresets } from '../../config/theme';

// UPDATED: Import the service as a default import
import sopService from '../../api/endpoints/sopService';

// Define the Compound type based on the C# model
interface Compound {
  analyteId: number;
  cas: string;
  name: string;
  ccCompoundName: string | null;
}

const CompoundManagement: React.FC = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  // Load compounds
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // UPDATED: Use the function from the service object
        const compoundsData = await sopService.fetchCompounds();

        setCompounds(compoundsData);
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

  // Handle saving a compound
  const handleSaveCompound = (record: Compound) => {
    // Here you would call the update API
    // For now we'll just update the local state

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

        resolve();
      }, 500); // Simulate network delay
    });
  };

  // Handle deleting a compound
  const handleDeleteCompound = (record: Compound) => {
    // Here you would call the delete API
    message.success(`Deleted Compound: ${record.name}`);

    // Update local state to reflect the deletion
    setCompounds(prevCompounds => prevCompounds.filter(c => c.analyteId !== record.analyteId));
  };

  // Handle adding a new compound
  const handleAddCompound = () => {
    // Create a new compound with default values
    const newCompound: Compound = {
      analyteId: -Date.now(), // Temporary negative ID
      cas: '',
      name: '',
      ccCompoundName: '',
    };

    // Add to the beginning of the array
    setCompounds([newCompound, ...compounds]);
  };

  // Filter compounds based on search text
  const filteredCompounds = compounds.filter(
    compound =>
      compound.name.toLowerCase().includes(searchText.toLowerCase()) ||
      compound.cas.toLowerCase().includes(searchText.toLowerCase()) ||
      (compound.ccCompoundName &&
        compound.ccCompoundName.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Table columns for the compounds list
  const columns: EditableColumn[] = [
    {
      title: 'CAS Number',
      dataIndex: 'cas',
      key: 'cas',
      editable: true,
      inputType: 'text',
      sorter: (a: Compound, b: Compound) => a.cas.localeCompare(b.cas),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
        selectedKeys: React.Key[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search CAS"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value: string | number | boolean, record: Compound) =>
        record.cas.toLowerCase().includes(value.toString().toLowerCase()),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      rules: [
        { required: true, message: 'Please enter the CAS number' },
        { max: 50, message: 'CAS number cannot exceed 50 characters' },
        {
          pattern: /^[0-9]{1,7}-[0-9]{2}-[0-9]$/,
          message: 'Please enter a valid CAS number format (e.g., 71-43-2)',
        },
      ],
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      sorter: (a: Compound, b: Compound) => a.name.localeCompare(b.name),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: {
        setSelectedKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
        selectedKeys: React.Key[];
        confirm: () => void;
        clearFilters: () => void;
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value: string | number | boolean, record: Compound) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      rules: [
        { required: true, message: 'Please enter the compound name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'CC Name',
      dataIndex: 'ccCompoundName',
      key: 'ccCompoundName',
      editable: true,
      inputType: 'text',
      rules: [{ max: 150, message: 'CC Name cannot exceed 150 characters' }],
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
