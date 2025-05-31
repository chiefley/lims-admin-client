import React, { useState, useEffect } from 'react';

import {
  PlusOutlined,
  FilterOutlined,
  EditOutlined,
  UserOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Row,
  Col,
  Input,
  Typography,
  message,
  Space,
  Checkbox,
  Table,
  Tag,
  Modal,
  Form,
  Tabs,
  Tooltip,
} from 'antd';

import { validationRules } from '../../utils/fieldValidation';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import FormItem from '../shared/components/FormItem';
import PageHeader from '../shared/components/PageHeader';
import { fetchSelectors } from '../shared/sharedService';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import { fetchClients, upsertClients } from './clientService';
import { Client, ClientStateLicense } from './types';

const { Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const ClientManagement: React.FC = () => {
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalForm] = Form.useForm();
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Check API client setup
  useEffect(() => {
    // Import the client directly for testing
    import('../../api/config')
      .then(module => {
        console.log('API config loaded:', {
          baseUrl: module.BASE_URL,
          defaultLabId: module.DEFAULT_LAB_ID,
        });

        // Check if apiClient is properly initialized
        if (module.apiClient) {
          console.log('API client initialized with baseURL:', module.apiClient.defaults.baseURL);
        } else {
          console.error('API client not properly initialized');
        }
      })
      .catch(err => {
        console.error('Error loading API config:', err);
      });
  }, []);

  // Handler to fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      console.log('Fetching clients data...');

      // Fetch clients
      const data = await fetchClients();
      console.log('Client data received:', data);

      setClients(data || []);

      // Fetch selectors if we don't have them yet
      if (!selectors) {
        console.log('Fetching selectors data...');
        const selectorsData = await fetchSelectors();
        console.log(
          'Selectors data received:',
          selectorsData?.clientLicenseTypes?.length || 0,
          'license types'
        );
        setSelectors(selectorsData);
      }
    } catch (error) {
      message.error('Failed to fetch clients');
      console.error('Error fetching clients:', error);
      setClients([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    console.log('ClientManagement component mounted, calling fetchData()');
    fetchData();

    // Add a second verification fetch after a short delay
    const timer = setTimeout(() => {
      console.log('Verification fetch - checking if initial fetch was successful');
      if (clients.length === 0) {
        console.log('No clients loaded yet, attempting fetch again');
        fetchData();
      } else {
        console.log('Clients already loaded, skipping secondary fetch');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Filter clients based on search text and active status
  useEffect(() => {
    if (!clients || !Array.isArray(clients)) {
      setFilteredClients([]);
      return;
    }

    let filtered = [...clients];

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(client => client.active !== false);
    }

    // Filter by search text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        client =>
          client.name.toLowerCase().includes(lowerCaseSearch) ||
          (client.dbaName ? client.dbaName.toLowerCase().includes(lowerCaseSearch) : false) ||
          (client.email ? client.email.toLowerCase().includes(lowerCaseSearch) : false) ||
          `${client.contactFirstName || ''} ${client.contactLastName || ''}`
            .toLowerCase()
            .includes(lowerCaseSearch) ||
          (client.phone ? client.phone.toLowerCase().includes(lowerCaseSearch) : false) ||
          (client.city ? client.city.toLowerCase().includes(lowerCaseSearch) : false)
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchText, showInactive]);

  // Handle adding a new client
  const handleAdd = () => {
    // Create a new client with default values
    const newClient: Client = {
      clientId: -Date.now(), // Temporary negative ID
      name: '',
      active: true,
      clientStateLicenseRss: [],
      clientPricingRss: [], // Initialize empty array for client pricing
    };

    setEditingClient(newClient);
    setModalVisible(true);
    // Reset form fields
    modalForm.resetFields();
    // Set form values from the new client
    modalForm.setFieldsValue(newClient);
  };

  // Handle editing a client
  const handleEdit = (client: Client) => {
    setEditingClient({ ...client });
    setModalVisible(true);
    // Reset form fields first
    modalForm.resetFields();
    // Set form values from the client
    modalForm.setFieldsValue({ ...client });
  };

  // Handle saving a client
  const handleSave = async () => {
    try {
      setModalLoading(true);

      // Validate form
      const values = await modalForm.validateFields();

      if (!editingClient) {
        throw new Error('No client is being edited');
      }

      // Create updated client object
      const updatedClient: Client = {
        ...editingClient,
        ...values,
      };

      // Clone the clients array and find the index of the client to update
      const newData = [...clients];
      const index = newData.findIndex(item => item.clientId === updatedClient.clientId);

      if (index > -1) {
        // Update existing client
        newData[index] = updatedClient;
      } else {
        // Add new client
        newData.push(updatedClient);
      }

      // Update state
      setClients(newData);

      // Save changes to server
      await upsertClients(newData);
      message.success('Client saved successfully');

      // Refresh data from server to get updated data
      fetchData();

      // Close modal
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to save client');
      console.error('Error saving client:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle deletion (setting inactive)
  const handleSetInactive = async (client: Client) => {
    try {
      if (client.clientId > 0) {
        // For existing clients, mark as inactive
        const updatedClient = { ...client, active: false };

        // Clone the clients array and find the index of the client to update
        const newData = [...clients];
        const index = newData.findIndex(item => item.clientId === client.clientId);

        if (index > -1) {
          // Update existing client
          newData[index] = updatedClient;

          // Update state
          setClients(newData);

          // Save changes to server
          await upsertClients(newData);
          message.success('Client marked as inactive');

          // Refresh data from server
          fetchData();
        }
      } else {
        // For new clients (negative IDs), just remove from state
        setClients(clients.filter(item => item.clientId !== client.clientId));
        message.success('New client removed');
      }
    } catch (error) {
      message.error('Failed to update client');
      console.error('Error updating client:', error);
    }
  };

  // Define license columns for nested table
  const licenseColumns: any[] = [
    {
      title: 'License Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
    },
    {
      title: 'License Type',
      dataIndex: 'clientLicenseTypeId',
      key: 'clientLicenseTypeId',
      render: (typeId: number) => {
        const licenseType = selectors?.clientLicenseTypes?.find(t => t.id === typeId);
        return licenseType ? licenseType.label : typeId;
      },
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
  ];

  // License table columns for the editable table in the modal
  const licenseEditColumns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      rules: [
        validationRules.required('License name is required'),
        validationRules.maxLength(150, 'License name cannot exceed 150 characters'),
      ],
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      editable: true,
      inputType: 'text',
      rules: [
        validationRules.required('License number is required'),
        validationRules.maxLength(100, 'License number cannot exceed 100 characters'),
      ],
    },
    {
      title: 'License Type',
      dataIndex: 'clientLicenseTypeId',
      key: 'clientLicenseTypeId',
      editable: true,
      inputType: 'select',
      options:
        selectors?.clientLicenseTypes?.map(type => ({
          value: type.id,
          label: type.label,
        })) || [],
      rules: [validationRules.required('License type is required')],
      render: (typeId: number) => {
        const licenseType = selectors?.clientLicenseTypes?.find(t => t.id === typeId);
        return licenseType ? licenseType.label : typeId;
      },
    },
    {
      title: 'CC License ID',
      dataIndex: 'ccLicenseId',
      key: 'ccLicenseId',
      editable: true,
      inputType: 'number',
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
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
  ];

  // Handle adding a license to the current client being edited
  const handleAddLicense = () => {
    if (!editingClient) return;

    const newLicense: ClientStateLicense = {
      clientStateLicenseId: -Date.now(), // Temporary negative ID
      name: '',
      licenseNumber: '',
      clientLicenseTypeId: selectors?.clientLicenseTypes?.[0]?.id || 0,
      active: true,
    };

    const updatedClient = {
      ...editingClient,
      clientStateLicenseRss: [...(editingClient.clientStateLicenseRss || []), newLicense],
    };

    setEditingClient(updatedClient);
  };

  // Handle saving a license in the editable table
  const handleSaveLicense = (license: ClientStateLicense) => {
    if (!editingClient) return;

    // Find the license index in the current client
    const licenseIndex = editingClient.clientStateLicenseRss.findIndex(
      l => l.clientStateLicenseId === license.clientStateLicenseId
    );

    let updatedLicenses;

    if (licenseIndex > -1) {
      // Update existing license
      updatedLicenses = [...editingClient.clientStateLicenseRss];
      updatedLicenses[licenseIndex] = license;
    } else {
      // Add new license
      updatedLicenses = [...editingClient.clientStateLicenseRss, license];
    }

    const updatedClient = {
      ...editingClient,
      clientStateLicenseRss: updatedLicenses,
    };

    setEditingClient(updatedClient);
  };

  // Handle deleting a license from the client being edited
  const handleDeleteLicense = (license: ClientStateLicense) => {
    if (!editingClient) return;

    // If it's a new license (negative ID), remove it completely
    if (license.clientStateLicenseId < 0) {
      const updatedLicenses = editingClient.clientStateLicenseRss.filter(
        l => l.clientStateLicenseId !== license.clientStateLicenseId
      );

      const updatedClient = {
        ...editingClient,
        clientStateLicenseRss: updatedLicenses,
      };

      setEditingClient(updatedClient);
    } else {
      // For existing licenses, mark as inactive
      const updatedLicenses = editingClient.clientStateLicenseRss.map(l =>
        l.clientStateLicenseId === license.clientStateLicenseId ? { ...l, active: false } : l
      );

      const updatedClient = {
        ...editingClient,
        clientStateLicenseRss: updatedLicenses,
      };

      setEditingClient(updatedClient);
    }
  };

  // Main table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Client) => (
        <Space>
          <Text strong>{text}</Text>
          {!record.active && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: 'DBA Name',
      dataIndex: 'dbaName',
      key: 'dbaName',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Client) => (
        <Space direction="vertical" size="small">
          {record.contactFirstName && record.contactLastName && (
            <Text>{`${record.contactFirstName} ${record.contactLastName}`}</Text>
          )}
          {record.phone && <Text>{record.phone}</Text>}
          {record.email && <Text>{record.email}</Text>}
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: any, record: Client) => (
        <Space direction="vertical" size="small">
          {record.address1 && <Text>{record.address1}</Text>}
          {record.address2 && <Text>{record.address2}</Text>}
          {record.city && record.postalCode && (
            <Text>{`${record.city}, ${record.postalCode}`}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Licenses',
      key: 'licenses',
      render: (_: any, record: Client) => {
        // Count active licenses
        const activeLicenses = record.clientStateLicenseRss?.filter(l => l.active !== false) || [];
        const inactiveLicenses =
          record.clientStateLicenseRss?.filter(l => l.active === false) || [];

        return (
          <Space>
            {activeLicenses.length > 0 && (
              <Tag color="green">{`${activeLicenses.length} Active`}</Tag>
            )}
            {inactiveLicenses.length > 0 && (
              <Tag color="orange">{`${inactiveLicenses.length} Inactive`}</Tag>
            )}
            {record.clientStateLicenseRss?.length === 0 && (
              <Text type="secondary">No licenses</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Client) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          {record.active && (
            <Tooltip title="Mark Inactive">
              <Button danger onClick={() => handleSetInactive(record)} size="small">
                Deactivate
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Client Management" subtitle="Manage client information and licenses" />

      <Card className="content-section">
        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={loading}>
              Add Client
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => {
                console.log('Manual fetch triggered by user');
                fetchData();
              }}
              disabled={loading}
            >
              Refresh Data
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
              placeholder="Search by name, contact, or location"
              allowClear
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="clientId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: record => (
              <Table
                columns={licenseColumns}
                dataSource={record.clientStateLicenseRss || []}
                rowKey="clientStateLicenseId"
                pagination={false}
                size="small"
              />
            ),
            expandRowByClick: true,
            rowExpandable: record =>
              record.clientStateLicenseRss && record.clientStateLicenseRss.length > 0,
          }}
        />

        {/* Debug Info */}
        <Card title="Debug Information" style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text strong>API Status:</Text>
              <div>clients.length: {clients.length}</div>
              <div>filteredClients.length: {filteredClients.length}</div>
              <div>loading: {loading.toString()}</div>
              <div>selectors loaded: {selectors ? 'Yes' : 'No'}</div>
            </Col>
            <Col span={8}>
              <Text strong>Filters:</Text>
              <div>showInactive: {showInactive.toString()}</div>
              <div>searchText: {searchText || '(none)'}</div>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                onClick={() => {
                  console.log('API investigation - current state:', {
                    clients,
                    filteredClients,
                    selectors,
                    loading,
                  });
                }}
              >
                Log State
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => {
                  // Add mock data for testing UI
                  const mockClients: Client[] = [
                    {
                      clientId: 1001,
                      name: 'Test Client 1',
                      dbaName: 'DBA Test 1',
                      contactFirstName: 'John',
                      contactLastName: 'Doe',
                      email: 'john@example.com',
                      phone: '555-123-4567',
                      address1: '123 Main St',
                      city: 'Anytown',
                      postalCode: '12345',
                      active: true,
                      clientStateLicenseRss: [
                        {
                          clientStateLicenseId: 2001,
                          name: 'Test License 1',
                          licenseNumber: 'LIC-1234',
                          clientLicenseTypeId: 1,
                          active: true,
                        },
                      ],
                      clientPricingRss: [],
                    },
                    {
                      clientId: 1002,
                      name: 'Test Client 2',
                      active: false,
                      clientStateLicenseRss: [],
                      clientPricingRss: [],
                    },
                  ];
                  console.log('Setting mock clients for testing');
                  setClients(mockClients);
                }}
              >
                Load Mock Data
              </Button>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* Client Edit Modal */}
      <Modal
        title={editingClient?.clientId && editingClient.clientId > 0 ? 'Edit Client' : 'Add Client'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        confirmLoading={modalLoading}
      >
        <Form form={modalForm} layout="vertical">
          <Tabs defaultActiveKey="basic">
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Client Information
                </span>
              }
              key="basic"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="name"
                    label="Client Name"
                    rules={[
                      validationRules.required('Client name is required'),
                      validationRules.maxLength(150, 'Name cannot exceed 150 characters'),
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="dbaName"
                    label="DBA Name"
                    rules={[
                      validationRules.maxLength(150, 'DBA name cannot exceed 150 characters'),
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="contactFirstName"
                    label="Contact First Name"
                    rules={[
                      validationRules.maxLength(100, 'First name cannot exceed 100 characters'),
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="contactLastName"
                    label="Contact Last Name"
                    rules={[
                      validationRules.maxLength(100, 'Last name cannot exceed 100 characters'),
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="email"
                    label="Email"
                    rules={[
                      validationRules.maxLength(150, 'Email cannot exceed 150 characters'),
                      { type: 'email', message: 'Please enter a valid email address' },
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="phone"
                    label="Phone"
                    rules={[validationRules.maxLength(20, 'Phone cannot exceed 20 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="address1"
                    label="Address Line 1"
                    rules={[validationRules.maxLength(150, 'Address cannot exceed 150 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="address2"
                    label="Address Line 2"
                    rules={[validationRules.maxLength(150, 'Address cannot exceed 150 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="city"
                    label="City"
                    rules={[validationRules.maxLength(100, 'City cannot exceed 100 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="postalCode"
                    label="Postal Code"
                    rules={[
                      validationRules.maxLength(10, 'Postal code cannot exceed 10 characters'),
                    ]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem name="ccClientId" label="CC Client ID">
                    <Input type="number" />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem name="ccPrimaryAddressId" label="CC Primary Address ID">
                    <Input type="number" />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <FormItem
                    name="limsClientApiID"
                    label="LIMS Client API ID"
                    rules={[validationRules.maxLength(100, 'API ID cannot exceed 100 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="limsClientApiKey"
                    label="LIMS Client API Key"
                    rules={[validationRules.maxLength(100, 'API Key cannot exceed 100 characters')]}
                  >
                    <Input />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <FormItem name="active" valuePropName="checked">
                    <Checkbox>Active</Checkbox>
                  </FormItem>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <IdcardOutlined />
                  Licenses
                </span>
              }
              key="licenses"
            >
              <CardSection title="Client Licenses">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddLicense}
                  style={{ marginBottom: 16 }}
                >
                  Add License
                </Button>

                <EditableTable
                  columns={licenseEditColumns}
                  dataSource={editingClient?.clientStateLicenseRss || []}
                  rowKey="clientStateLicenseId"
                  onSave={handleSaveLicense}
                  onDelete={handleDeleteLicense}
                  pagination={false}
                  editable={true}
                />
              </CardSection>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientManagement;
