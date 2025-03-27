import React, { useState, useEffect } from 'react';
import { Typography, Space, message, Spin, Tag, Tooltip, Card, Alert, Modal, Button } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { fetchBatchSopSelections, fetchSelectors } from '../../api/endpoints/sopService';
import {
  PrepBatchSopSelectionRs,
  ManifestSamplePrepBatchSopRs,
  SopMaintenanceSelectors,
} from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import StyledTable from '../../components/tables/StyledTable';
import PrepBatchSopForm from '../../components/forms/PrepBatchSopForm';
import ManifestSampleForm from '../../components/forms/ManifestSampleForm';
import ModelAdapter from '../../utils/ModelAdapter';

const { Text } = Typography;

const PrepBatchSopManagement: React.FC = () => {
  const [prepBatchSops, setPrepBatchSops] = useState<PrepBatchSopSelectionRs[]>([]);
  const [selectors, setSelectors] = useState<SopMaintenanceSelectors>({
    manifestSampleTypeItems: [],
    panelGroupItems: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [sampleEditModalVisible, setSampleEditModalVisible] = useState<boolean>(false);
  const [currentSop, setCurrentSop] = useState<PrepBatchSopSelectionRs | null>(null);
  const [currentSample, setCurrentSample] = useState<ManifestSamplePrepBatchSopRs | null>(null);
  const [parentSopId, setParentSopId] = useState<number | null>(null);

  // Load prep batch SOPs and selectors for dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch both data sets in parallel
        const [sopsData, selectorsData] = await Promise.all([
          fetchBatchSopSelections(),
          fetchSelectors(),
        ]);

        setPrepBatchSops(sopsData);
        setSelectors(selectorsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Table columns for the main prep batch SOP list
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: PrepBatchSopSelectionRs, b: PrepBatchSopSelectionRs) =>
        a.name.localeCompare(b.name),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: PrepBatchSopSelectionRs, b: PrepBatchSopSelectionRs) =>
        a.name.localeCompare(b.name),
    },
    {
      title: 'SOP',
      dataIndex: 'sop',
      key: 'sop',
      render: (text: string) => (
        <Tag color="blue" icon={<ExperimentOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'SOP Group',
      dataIndex: 'sopGroup',
      key: 'sopGroup',
    },
    {
      title: 'Sample Types',
      key: 'sampleTypes',
      render: (_: any, record: PrepBatchSopSelectionRs) => {
        const count = record.manifestSamplePrepBatchSopRss.length;
        return (
          <Tooltip title={`${count} sample type(s) configured`}>
            <Tag color="volcano">{count}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PrepBatchSopSelectionRs) => (
        <Space size="small">
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() => handleEdit(record)}
              style={{ cursor: 'pointer', color: '#1677ff' }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              onClick={() => handleDelete(record.batchSopId)}
              style={{ cursor: 'pointer', color: '#ff4d4f' }}
            />
          </Tooltip>
          <Tooltip title="Add Sample Type">
            <PlusOutlined
              onClick={() => handleAddSample(record.batchSopId)}
              style={{ cursor: 'pointer', color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <InfoCircleOutlined
              onClick={() => handleViewDetails(record)}
              style={{ cursor: 'pointer', color: '#1677ff' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expandable row showing the sample types and panel groups
  const expandedRowRender = (record: PrepBatchSopSelectionRs) => {
    const sampleColumns = [
      {
        title: 'Sample Type',
        dataIndex: 'manifestSampleTypeId',
        key: 'manifestSampleTypeId',
        render: (id: number) => {
          return ModelAdapter.getSampleTypeLabel(selectors, id);
        },
      },
      {
        title: 'Panel Group',
        dataIndex: 'panelGroupId',
        key: 'panelGroupId',
        render: (id: number) => {
          return ModelAdapter.getPanelGroupLabel(selectors, id);
        },
      },
      {
        title: 'Panels',
        dataIndex: 'panels',
        key: 'panels',
        render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
      },
      {
        title: 'Effective Date',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        render: (text: string) => new Date(text).toLocaleDateString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, sample: ManifestSamplePrepBatchSopRs) => (
          <Space size="small">
            <Tooltip title="Edit Sample">
              <EditOutlined
                onClick={() => handleEditSample(sample, record.batchSopId)}
                style={{ cursor: 'pointer', color: '#1677ff' }}
              />
            </Tooltip>
            <Tooltip title="Delete Sample">
              <DeleteOutlined
                onClick={() => handleDeleteSample(sample.manifestSamplePrepBatchSopId)}
                style={{ cursor: 'pointer', color: '#ff4d4f' }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <Card
        size="small"
        title={<Text strong>Sample Types and Panel Groups</Text>}
        style={{ marginLeft: 48, marginRight: 48 }}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddSample(record.batchSopId)}
          >
            Add Sample Type
          </Button>
        }
      >
        {record.manifestSamplePrepBatchSopRss.length === 0 ? (
          <Alert
            message="No sample types configured"
            description="Click 'Add Sample Type' to configure sample types for this SOP."
            type="info"
            showIcon
          />
        ) : (
          <StyledTable
            columns={sampleColumns}
            dataSource={record.manifestSamplePrepBatchSopRss}
            rowKey="manifestSamplePrepBatchSopId"
            pagination={false}
            size="small"
            striped
          />
        )}
      </Card>
    );
  };

  // Event handlers
  const handleEdit = (record: PrepBatchSopSelectionRs) => {
    setCurrentSop(record);
    setEditModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this Prep SOP?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Here you would call the delete API
        message.success(`Deleted Prep SOP with ID: ${id}`);
        // After successful deletion, you would refresh the data
        setPrepBatchSops(prevSops => prevSops.filter(sop => sop.batchSopId !== id));
      },
    });
  };

  const handleViewDetails = (record: PrepBatchSopSelectionRs) => {
    Modal.info({
      title: `${record.name} (${record.sop} v${record.version})`,
      content: (
        <div>
          <p>
            <strong>SOP Group:</strong> {record.sopGroup}
          </p>
          <p>
            <strong>Lab ID:</strong> {record.labId}
          </p>
          <p>
            <strong>Sample Types:</strong> {record.manifestSamplePrepBatchSopRss.length}
          </p>
        </div>
      ),
      width: 500,
    });
  };

  const handleSubmitSopEdit = (values: PrepBatchSopSelectionRs) => {
    // Here you would call the update API
    message.success(`Updated Prep SOP: ${values.name}`);

    // Update the local state to reflect changes
    setPrepBatchSops(prevSops =>
      prevSops.map(sop => (sop.batchSopId === values.batchSopId ? values : sop))
    );

    setEditModalVisible(false);
    setCurrentSop(null);
  };

  const handleAddSample = (batchSopId: number) => {
    // Create a new empty sample with default values
    // Note: In your model, you might want to handle the case where the dropdown needs a null/undefined
    // initial value to show the placeholder. For this fix, we'll use actual ID values.
    const newSample: ManifestSamplePrepBatchSopRs = {
      manifestSamplePrepBatchSopId: 0, // Will be assigned by the server
      batchSopId: batchSopId,
      // If we have any selectors, use the first one as default, otherwise use null
      manifestSampleTypeId:
        selectors.manifestSampleTypeItems.length > 0
          ? Number(selectors.manifestSampleTypeItems[0].id)
          : 0,
      panelGroupId:
        selectors.panelGroupItems.length > 0 ? Number(selectors.panelGroupItems[0].id) : 0,
      panels: '',
      effectiveDate: new Date().toISOString(),
    };

    setCurrentSample(newSample);
    setParentSopId(batchSopId);
    setSampleEditModalVisible(true);
  };

  const handleEditSample = (sample: ManifestSamplePrepBatchSopRs, batchSopId: number) => {
    setCurrentSample({ ...sample }); // Create a copy to avoid reference issues
    setParentSopId(batchSopId);
    setSampleEditModalVisible(true);
  };

  const handleDeleteSample = (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this sample configuration?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Here you would call the delete API
        message.success(`Deleted sample configuration with ID: ${id}`);

        // Update local state to reflect the deletion
        setPrepBatchSops(prevSops =>
          prevSops.map(sop => ({
            ...sop,
            manifestSamplePrepBatchSopRss: sop.manifestSamplePrepBatchSopRss.filter(
              sample => sample.manifestSamplePrepBatchSopId !== id
            ),
          }))
        );
      },
    });
  };

  const handleSubmitSampleEdit = (values: ManifestSamplePrepBatchSopRs) => {
    // Here you would call the update API
    message.success(`Updated sample configuration`);

    // Update the local state to reflect changes
    setPrepBatchSops(prevSops =>
      prevSops.map(sop => {
        if (sop.batchSopId === parentSopId) {
          // If it's a new sample (id is 0), generate a temporary ID
          if (values.manifestSamplePrepBatchSopId === 0) {
            const newId = Math.floor(Math.random() * -1000) - 1; // Negative ID to avoid conflicts
            const updatedSamples = [
              ...sop.manifestSamplePrepBatchSopRss,
              {
                ...values,
                manifestSamplePrepBatchSopId: newId,
              },
            ];
            return {
              ...sop,
              manifestSamplePrepBatchSopRss: updatedSamples,
            };
          } else {
            // If it's an existing sample, update it
            const updatedSamples = sop.manifestSamplePrepBatchSopRss.map(sample =>
              sample.manifestSamplePrepBatchSopId === values.manifestSamplePrepBatchSopId
                ? values
                : sample
            );
            return {
              ...sop,
              manifestSamplePrepBatchSopRss: updatedSamples,
            };
          }
        }
        return sop;
      })
    );

    setSampleEditModalVisible(false);
    setCurrentSample(null);
    setParentSopId(null);
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Prep Batch SOP Management"
        subtitle="Configure and manage standard operating procedures for sample preparation batch processing"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add New SOP
          </Button>
        }
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

      <CardSection icon={<UnorderedListOutlined />} title="Prep Batch SOPs">
        <Spin spinning={loading}>
          <StyledTable
            columns={columns}
            dataSource={prepBatchSops}
            rowKey="batchSopId"
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
            striped
          />
        </Spin>
      </CardSection>

      {/* Edit Prep Batch SOP Modal */}
      <Modal
        title="Edit Prep Batch SOP"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentSop && (
          <PrepBatchSopForm
            initialValues={currentSop}
            onSubmit={handleSubmitSopEdit}
            onCancel={() => setEditModalVisible(false)}
          />
        )}
      </Modal>

      {/* Edit/Add Sample Type Modal */}
      <Modal
        title={
          currentSample?.manifestSamplePrepBatchSopId === 0 ? 'Add Sample Type' : 'Edit Sample Type'
        }
        open={sampleEditModalVisible}
        onCancel={() => setSampleEditModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentSample && (
          <ManifestSampleForm
            initialValues={currentSample}
            selectors={selectors}
            onSubmit={handleSubmitSampleEdit}
            onCancel={() => setSampleEditModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default PrepBatchSopManagement;
