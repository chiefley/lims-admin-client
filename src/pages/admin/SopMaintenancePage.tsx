// src/pages/admin/SopMaintenancePage.tsx

import React, { useState, useEffect } from 'react';
import { Table, Card, Button, message, Space, Typography, Spin, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import sopMaintenanceApi from '../../api/sopMaintenanceApi';
import {
  PrepBatchSopSelectionRs,
  SopMaintenanceSelectors,
  ManifestSamplePrepBatchSopRs,
} from '../../models/types';
import BatchSopForm from '../../components/forms/BatchSopForm';
import ManifestSampleForm from '../../components/forms/ManifestSampleForm';

const { Title } = Typography;

const SopMaintenancePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [batchSops, setBatchSops] = useState<PrepBatchSopSelectionRs[]>([]);
  const [selectors, setSelectors] = useState<SopMaintenanceSelectors | null>(null);
  const [editingSop, setEditingSop] = useState<PrepBatchSopSelectionRs | null>(null);
  const [isSopModalVisible, setIsSopModalVisible] = useState<boolean>(false);
  const [editingManifestSample, setEditingManifestSample] =
    useState<ManifestSamplePrepBatchSopRs | null>(null);
  const [isManifestModalVisible, setIsManifestModalVisible] = useState<boolean>(false);
  const [selectedSopId, setSelectedSopId] = useState<number | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data from API...');

        // Fetch selectors
        try {
          console.log('Fetching selectors...');
          const selectorsData = await sopMaintenanceApi.fetchSelectors();
          console.log('Selectors data received:', selectorsData);
          setSelectors(selectorsData);
        } catch (selectorsError) {
          console.error('Error fetching selectors:', selectorsError);
          message.error('Failed to load dropdown options. Check the API endpoint.');
        }

        // Fetch SOP data
        try {
          console.log('Fetching batch SOPs...');
          const sopData = await sopMaintenanceApi.fetchBatchSopSelections();
          console.log('SOP data received:', sopData);
          setBatchSops(sopData);
        } catch (sopError) {
          console.error('Error fetching batch SOPs:', sopError);
          message.error('Failed to load SOP data. Check the API endpoint.');
        }
      } catch (error) {
        message.error('Failed to load data. Please try again.');
        console.error('General error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers for SOP editing
  const handleEditSop = (record: PrepBatchSopSelectionRs) => {
    setEditingSop({ ...record });
    setIsSopModalVisible(true);
  };

  const handleAddSop = () => {
    setEditingSop({
      batchSopId: 0,
      name: '',
      sop: '',
      version: '',
      sopGroup: '',
      labId: 1001,
      manifestSamplePrepBatchSopRss: [],
      $type: 'PrepBatchSopSelectionRs',
    });
    setIsSopModalVisible(true);
  };

  const handleSopModalCancel = () => {
    setEditingSop(null);
    setIsSopModalVisible(false);
  };

  const handleSopFormSubmit = async (values: any) => {
    // In a real application, you would save the data to the server here
    console.log('Submitting SOP:', values);
    message.success('SOP saved successfully');
    setIsSopModalVisible(false);

    // Refresh data
    try {
      const sopData = await sopMaintenanceApi.fetchBatchSopSelections();
      setBatchSops(sopData);
    } catch (error) {
      message.error('Failed to refresh data');
    }
  };

  // Handlers for Manifest Sample editing
  const handleEditManifestSample = (record: ManifestSamplePrepBatchSopRs, sopId: number) => {
    setEditingManifestSample({ ...record });
    setSelectedSopId(sopId);
    setIsManifestModalVisible(true);
  };

  const handleAddManifestSample = (sopId: number) => {
    setEditingManifestSample({
      manifestSamplePrepBatchSopId: 0,
      batchSopId: sopId,
      manifestSampleTypeId: 0, // Changed from null to 0
      panelGroupId: 0, // Changed from null to 0
      panels: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setSelectedSopId(sopId);
    setIsManifestModalVisible(true);
  };

  const handleManifestModalCancel = () => {
    setEditingManifestSample(null);
    setIsManifestModalVisible(false);
    setSelectedSopId(null);
  };

  const handleManifestFormSubmit = async (values: any) => {
    // In a real application, you would save the data to the server here
    console.log('Submitting Manifest Sample:', values);
    message.success('Manifest Sample saved successfully');
    setIsManifestModalVisible(false);

    // Refresh data
    try {
      const sopData = await sopMaintenanceApi.fetchBatchSopSelections();
      setBatchSops(sopData);
    } catch (error) {
      message.error('Failed to refresh data');
    }
  };

  // Debug information about the state
  console.log('Current state:', {
    loading,
    batchSopsCount: batchSops.length,
    selectorsLoaded: !!selectors,
    editingSop,
    editingManifestSample,
  });

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Display a message if we have no data
  if (batchSops.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={2}>SOP Maintenance</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSop}>
                Add New SOP
              </Button>
            </div>

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Typography.Text>
                No SOP data available. You can add a new SOP using the button above.
              </Typography.Text>
            </div>
          </Space>
        </Card>
      </div>
    );
  }

  // Prepare nested table for manifest samples
  const expandedRowRender = (record: PrepBatchSopSelectionRs) => {
    // Check if manifestSamplePrepBatchSopRss is available and not empty
    if (
      !record.manifestSamplePrepBatchSopRss ||
      record.manifestSamplePrepBatchSopRss.length === 0
    ) {
      return (
        <div>
          <p>No sample configurations available for this SOP.</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddManifestSample(record.batchSopId)}
          >
            Add Sample Configuration
          </Button>
        </div>
      );
    }

    const columns = [
      {
        title: 'Sample Type',
        dataIndex: 'manifestSampleTypeId',
        key: 'manifestSampleTypeId',
        render: (typeId: number) => {
          const item = selectors?.manifestSampleTypeItems?.find(item => item.id === typeId);
          return item ? item.label : `Type ID: ${typeId}`;
        },
      },
      {
        title: 'Panel Group',
        dataIndex: 'panelGroupId',
        key: 'panelGroupId',
        render: (groupId: number) => {
          const item = selectors?.panelGroupItems?.find(item => item.id === groupId);
          return item ? item.label : `Group ID: ${groupId}`;
        },
      },
      {
        title: 'Panels',
        dataIndex: 'panels',
        key: 'panels',
      },
      {
        title: 'Effective Date',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: any, manifestSample: ManifestSamplePrepBatchSopRs) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditManifestSample(manifestSample, record.batchSopId)}
          >
            Edit
          </Button>
        ),
      },
    ];

    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddManifestSample(record.batchSopId)}
          >
            Add Sample Configuration
          </Button>
        </Space>
        <Table
          columns={columns}
          dataSource={record.manifestSamplePrepBatchSopRss}
          pagination={false}
          rowKey="manifestSamplePrepBatchSopId"
        />
      </div>
    );
  };

  // Main SOP table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SOP',
      dataIndex: 'sop',
      key: 'sop',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'SOP Group',
      dataIndex: 'sopGroup',
      key: 'sopGroup',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: PrepBatchSopSelectionRs) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSop(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>SOP Maintenance</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSop}>
              Add New SOP
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={batchSops}
            rowKey="batchSopId"
            expandable={{
              expandedRowRender,
              defaultExpandAllRows: false,
            }}
          />
        </Space>
      </Card>

      {/* SOP Edit Modal */}
      <Modal
        title={editingSop?.batchSopId ? 'Edit SOP' : 'Add New SOP'}
        open={isSopModalVisible}
        onCancel={handleSopModalCancel}
        footer={null}
        width={700}
      >
        {editingSop && (
          <BatchSopForm
            initialValues={editingSop}
            onSubmit={handleSopFormSubmit}
            onCancel={handleSopModalCancel}
          />
        )}
      </Modal>

      {/* Manifest Sample Edit Modal */}
      <Modal
        title={
          editingManifestSample?.manifestSamplePrepBatchSopId
            ? 'Edit Sample Configuration'
            : 'Add Sample Configuration'
        }
        open={isManifestModalVisible}
        onCancel={handleManifestModalCancel}
        footer={null}
        width={700}
      >
        {editingManifestSample && selectors && (
          <ManifestSampleForm
            initialValues={editingManifestSample}
            selectors={selectors}
            onSubmit={handleManifestFormSubmit}
            onCancel={handleManifestModalCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default SopMaintenancePage;
