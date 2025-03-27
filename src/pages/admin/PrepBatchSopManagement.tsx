import React, { useState, useEffect } from 'react';
import { Typography, Button, Space, message, Spin, Tag, Tooltip, Card, Alert } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { fetchBatchSopSelections } from '../../api/endpoints/sopService';
import { PrepBatchSopSelectionRs } from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import StyledTable from '../../components/tables/StyledTable';

const { Text } = Typography;

const PrepBatchSopManagement: React.FC = () => {
  const [prepBatchSops, setPrepBatchSops] = useState<PrepBatchSopSelectionRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load prep batch SOPs
  useEffect(() => {
    const loadPrepBatchSops = async () => {
      try {
        setLoading(true);
        const data = await fetchBatchSopSelections();
        setPrepBatchSops(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load prep batch SOPs');
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadPrepBatchSops();
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
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.batchSopId)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetails(record)}
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
        title: 'Sample Type ID',
        dataIndex: 'manifestSampleTypeId',
        key: 'manifestSampleTypeId',
      },
      {
        title: 'Panel Group ID',
        dataIndex: 'panelGroupId',
        key: 'panelGroupId',
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
    ];

    return (
      <Card
        size="small"
        title={<Text strong>Sample Types and Panel Groups</Text>}
        style={{ marginLeft: 48, marginRight: 48 }}
      >
        <StyledTable
          columns={sampleColumns}
          dataSource={record.manifestSamplePrepBatchSopRss}
          rowKey="manifestSamplePrepBatchSopId"
          pagination={false}
          size="small"
          striped
        />
      </Card>
    );
  };

  // Event handlers
  const handleAdd = () => {
    message.info('Add functionality will be implemented');
    // This would open a modal or navigate to a form to add a new Prep SOP
  };

  const handleEdit = (record: PrepBatchSopSelectionRs) => {
    message.info(`Edit Prep SOP: ${record.name}`);
    // This would open a modal or navigate to a form with the record data
  };

  const handleDelete = (id: number) => {
    message.info(`Delete Prep SOP with ID: ${id}`);
    // This would show a confirmation dialog and then delete the record
  };

  const handleViewDetails = (record: PrepBatchSopSelectionRs) => {
    message.info(`View details for Prep SOP: ${record.name}`);
    // This would show a modal with detailed information
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Prep Batch SOP Management"
        subtitle="Configure and manage standard operating procedures for sample preparation batch processing"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New Prep SOP
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
    </div>
  );
};

export default PrepBatchSopManagement;
