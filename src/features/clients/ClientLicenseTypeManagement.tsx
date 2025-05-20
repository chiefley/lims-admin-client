import React, { useState, useEffect } from 'react';

import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, Card, Row, Col, Input, Typography, message, Space, Checkbox, Select } from 'antd';

import { validationRules } from '../../utils/fieldValidation';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import { fetchSelectors } from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import { fetchClientLicenseTypes, upsertClientLicenseTypes } from './clientService';
import { ClientLicenseType } from './types';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ClientLicenseTypeManagement: React.FC = () => {
  // State
  const [licenseTypes, setLicenseTypes] = useState<ClientLicenseType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredTypes, setFilteredTypes] = useState<ClientLicenseType[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [stateId, setStateId] = useState<number>(2); // Default state ID from your config

  // Handler to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch license types for the selected state
      const data = await fetchClientLicenseTypes(stateId);
      setLicenseTypes(data);

      // Fetch selectors if we don't have them yet
      if (!selectors) {
        const selectorsData = await fetchSelectors();
        setSelectors(selectorsData);
      }
    } catch (error) {
      message.error('Failed to fetch client license types');
      console.error('Error fetching client license types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchData();
  }, [stateId]); // Refetch when stateId changes

  // Filter license types based on search text and active status
  useEffect(() => {
    let filtered = [...licenseTypes];

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(type => type.active !== false);
    }

    // Filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        type =>
          type.name.toLowerCase().includes(lowerCaseSearch) ||
          type.description?.toLowerCase().includes(lowerCaseSearch) ||
          false
      );
    }

    setFilteredTypes(filtered);
  }, [licenseTypes, searchText, showInactive]);

  // Define editable columns
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      rules: [
        validationRules.required('Name is required'),
        validationRules.maxLength(150, 'Name cannot exceed 150 characters'),
      ],
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      editable: true,
      inputType: 'textarea',
      rules: [validationRules.maxLength(500, 'Description cannot exceed 500 characters')],
    },
    {
      title: 'License Format',
      dataIndex: 'licenseFormat',
      key: 'licenseFormat',
      editable: true,
      inputType: 'text',
      rules: [validationRules.maxLength(50, 'License format cannot exceed 50 characters')],
    },
    {
      title: 'License Category',
      dataIndex: 'clientLicenseCategoryId',
      key: 'clientLicenseCategoryId',
      editable: true,
      inputType: 'select',
      width: 200,
      options:
        selectors?.clientLicenseCategories?.map(item => ({
          value: item.id,
          label: item.label,
        })) || [],
      render: (value: number) => {
        const category = selectors?.clientLicenseCategories?.find(cat => cat.id === value);
        return category ? category.label : value;
      },
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: true,
      inputType: 'select',
      width: 120,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (active: boolean) => (
        <Text type={active ? 'success' : 'danger'}>{active ? 'Yes' : 'No'}</Text>
      ),
    },
  ];

  // Handle saving a license type
  const handleSave = async (record: ClientLicenseType) => {
    try {
      // Ensure stateId is set correctly
      record.stateId = stateId;

      // Clone the license types array and find the index of the type to update
      const newData = [...licenseTypes];
      const index = newData.findIndex(
        item => item.clientLicenseTypeId === record.clientLicenseTypeId
      );

      if (index > -1) {
        // Update existing record
        newData[index] = record;
      } else {
        // Add new record
        newData.push(record);
      }

      // Update state
      setLicenseTypes(newData);

      // Save changes to server
      await upsertClientLicenseTypes(newData, stateId);
      message.success('Client license type saved successfully');

      // Refresh data from server
      fetchData();
    } catch (error) {
      message.error('Failed to save client license type');
      console.error('Error saving client license type:', error);
    }
  };

  // Handle adding a new license type
  const handleAdd = () => {
    const newLicenseType: ClientLicenseType = {
      clientLicenseTypeId: -Date.now(), // Temporary negative ID
      name: '',
      stateId: stateId,
      clientLicenseCategoryId: selectors?.clientLicenseCategories?.[0]?.id || 0,
      active: true,
    };

    setLicenseTypes([...licenseTypes, newLicenseType]);
  };

  // Handle deleting a license type
  const handleDelete = async (record: ClientLicenseType) => {
    try {
      // If the record has a positive ID (exists on the server)
      if (record.clientLicenseTypeId > 0) {
        // Mark as inactive instead of deleting
        const updatedRecord = { ...record, active: false };
        await handleSave(updatedRecord);
      } else {
        // For new records (negative IDs), remove from state
        setLicenseTypes(
          licenseTypes.filter(item => item.clientLicenseTypeId !== record.clientLicenseTypeId)
        );
      }

      message.success('Client license type deleted successfully');
    } catch (error) {
      message.error('Failed to delete client license type');
      console.error('Error deleting client license type:', error);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Client License Type Management"
        subtitle="Manage client license types for specific states"
      />

      <Card className="content-section">
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={loading}>
              Add License Type
            </Button>
          </Col>
          <Col>
            <Select value={stateId} onChange={setStateId} style={{ width: 150 }} disabled={loading}>
              <Option value={2}>California</Option>
              {/* Add other states as needed */}
            </Select>
          </Col>
          <Col>
            <Space>
              <Text strong>
                <FilterOutlined /> Filters:
              </Text>
              <Checkbox checked={showInactive} onChange={e => setShowInactive(e.target.checked)}>
                Show Inactive
              </Checkbox>
            </Space>
          </Col>
          <Col flex="auto">
            <Search
              placeholder="Search by name or description"
              allowClear
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        <EditableTable
          columns={columns}
          dataSource={filteredTypes}
          rowKey="clientLicenseTypeId"
          loading={loading}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdd={handleAdd}
          editable={true}
          pagination={{ pageSize: 10 }}
          showDeleteButton={record => record.clientLicenseTypeId < 0}
        />
      </Card>
    </div>
  );
};

export default ClientLicenseTypeManagement;
