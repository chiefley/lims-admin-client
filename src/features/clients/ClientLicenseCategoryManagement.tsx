import React, { useState, useEffect } from 'react';

import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { Button, Card, Row, Col, Input, Typography, message, Space, Checkbox } from 'antd';

import { validationRules } from '../../utils/fieldValidation';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';

import clientsService from './clientService';
import { ClientLicenseCategory } from './types';

const { Text } = Typography;
const { Search } = Input;

const ClientLicenseCategoryManagement: React.FC = () => {
  // State for client license categories
  const [licenseCategories, setLicenseCategories] = useState<ClientLicenseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredCategories, setFilteredCategories] = useState<ClientLicenseCategory[]>([]);

  // Handler to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await clientsService.fetchClientLicenseCategories();
      setLicenseCategories(data);
    } catch (error) {
      message.error('Failed to fetch client license categories');
      console.error('Error fetching client license categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchData();
  }, []);

  // Filter categories based on search text and active status
  useEffect(() => {
    let filtered = [...licenseCategories];

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(category => category.active !== false);
    }

    // Filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        category =>
          category.name.toLowerCase().includes(lowerCaseSearch) ||
          category.description?.toLowerCase().includes(lowerCaseSearch) ||
          false
      );
    }

    setFilteredCategories(filtered);
  }, [licenseCategories, searchText, showInactive]);

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

  // Handle saving a category
  const handleSave = async (record: ClientLicenseCategory) => {
    try {
      // Clone the categories array and find the index of the category to update
      const newData = [...licenseCategories];
      const index = newData.findIndex(
        item => item.clientLicenseCategoryId === record.clientLicenseCategoryId
      );

      if (index > -1) {
        // Update existing record
        newData[index] = record;
      } else {
        // Add new record
        newData.push(record);
      }

      // Update state
      setLicenseCategories(newData);

      // Save changes to server
      await clientsService.upsertClientLicenseCategories(newData);
      message.success('Client license category saved successfully');

      // Refresh data from server
      fetchData();
    } catch (error) {
      message.error('Failed to save client license category');
      console.error('Error saving client license category:', error);
    }
  };

  // Handle adding a new category
  const handleAdd = () => {
    const newCategory: ClientLicenseCategory = {
      clientLicenseCategoryId: -Date.now(), // Temporary negative ID
      name: '',
      active: true,
    };

    setLicenseCategories([...licenseCategories, newCategory]);
  };

  // Handle deleting a category
  const handleDelete = async (record: ClientLicenseCategory) => {
    try {
      // If the record has a positive ID (exists on the server)
      if (record.clientLicenseCategoryId > 0) {
        // Mark as inactive instead of deleting
        const updatedRecord = { ...record, active: false };
        await handleSave(updatedRecord);
      } else {
        // For new records (negative IDs), remove from state
        setLicenseCategories(
          licenseCategories.filter(
            item => item.clientLicenseCategoryId !== record.clientLicenseCategoryId
          )
        );
      }

      message.success('Client license category deleted successfully');
    } catch (error) {
      message.error('Failed to delete client license category');
      console.error('Error deleting client license category:', error);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Client License Category Management"
        subtitle="Manage client license categories used throughout the system"
      />

      <Card className="content-section">
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={loading}>
              Add Category
            </Button>
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
          dataSource={filteredCategories}
          rowKey="clientLicenseCategoryId"
          loading={loading}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdd={handleAdd}
          editable={true}
          pagination={{ pageSize: 10 }}
          showDeleteButton={record => record.clientLicenseCategoryId < 0}
        />
      </Card>
    </div>
  );
};

export default ClientLicenseCategoryManagement;
