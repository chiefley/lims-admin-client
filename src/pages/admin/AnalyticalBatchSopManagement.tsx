import React, { useState, useEffect } from 'react';
import { Typography, Spin, Tag, Tooltip, Alert, Button, Input, Popconfirm, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExperimentOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import sopService from '../../api/endpoints/sopService'; // Changed import to use default export
import { AnalyticalBatchSopSelectionRs } from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';

// Import editable table styles
import '../../styles/editableTable.css';
import { message } from 'antd';

const { Text } = Typography;

const AnalyticalBatchSopManagement: React.FC = () => {
  const navigate = useNavigate();
  const [analyticalBatchSops, setAnalyticalBatchSops] = useState<AnalyticalBatchSopSelectionRs[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytical batch SOPs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sopsData = await sopService.fetchAnalyticalBatchSopSelections(); // Changed to use default export

        // Log the data to check batchCount values
        console.log('Fetched Analytical SOPs:', sopsData);

        setAnalyticalBatchSops(sopsData);
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

  // Handle saving a batch SOP record
  const handleSaveSop = (record: AnalyticalBatchSopSelectionRs) => {
    // Here you would call the update API
    // For now we'll just update the local state

    // Simulate async operation
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success(`Updated Analytical SOP: ${record.name}`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = record.batchSopId < 0;
        const updatedRecord = isNew
          ? { ...record, batchSopId: Math.floor(Math.random() * 1000) + 100 }
          : record;

        // Update the local state
        setAnalyticalBatchSops(prevSops => {
          if (isNew) {
            // Replace the temp record with the "saved" one
            return [...prevSops.filter(sop => sop.batchSopId !== record.batchSopId), updatedRecord];
          } else {
            // Update existing record
            return prevSops.map(sop =>
              sop.batchSopId === record.batchSopId ? updatedRecord : sop
            );
          }
        });

        resolve();
      }, 500); // Simulate network delay
    });
  };

  // Handle deleting a batch SOP record
  const handleDeleteSop = (record: AnalyticalBatchSopSelectionRs) => {
    // Here you would call the delete API
    message.success(`Deleted Analytical SOP: ${record.name}`);

    // Update local state to reflect the deletion
    setAnalyticalBatchSops(prevSops =>
      prevSops.filter(sop => sop.batchSopId !== record.batchSopId)
    );
  };

  // Handle navigation to the detail page
  const handleViewDetails = (record: AnalyticalBatchSopSelectionRs) => {
    navigate(`/admin/analytical-batch-sop/${record.batchSopId}`);
  };

  // Table columns for the main analytical batch SOP list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: false,
      inputType: 'text',
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: AnalyticalBatchSopSelectionRs, b: AnalyticalBatchSopSelectionRs) =>
        a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the Analytical SOP name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'SOP',
      dataIndex: 'sop',
      key: 'sop',
      editable: false,
      inputType: 'text',
      render: (text: string) => (
        <Tag color="blue" icon={<ExperimentOutlined />}>
          {text}
        </Tag>
      ),
      rules: [
        { required: true, message: 'Please enter the SOP identifier' },
        { max: 50, message: 'SOP cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      editable: false,
      inputType: 'text',
      render: (text: string) => <Tag color="green">{text}</Tag>,
      rules: [
        { required: true, message: 'Please enter the version' },
        { max: 10, message: 'Version cannot exceed 10 characters' },
      ],
    },
    {
      title: 'SOP Group',
      dataIndex: 'sopGroup',
      key: 'sopGroup',
      editable: false,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter the SOP group' },
        { max: 50, message: 'SOP Group cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Batch Count',
      key: 'batchCount',
      dataIndex: 'batchCount',
      editable: false,
      render: (count: number) => {
        return (
          <Tooltip title={`${count} batch(es) using this SOP`}>
            <Tag color="volcano">{count}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'actions',
      width: 120,
      render: (_: any, record: AnalyticalBatchSopSelectionRs) => {
        // Check if batchCount is exactly 0
        const hasZeroBatchCount = record.batchCount === 0;

        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  handleViewDetails(record);
                }}
              />
            </Tooltip>

            {hasZeroBatchCount && (
              <Tooltip title="Delete">
                <Popconfirm
                  title="Are you sure you want to delete this SOP?"
                  onConfirm={e => {
                    e?.stopPropagation();
                    handleDeleteSop(record);
                  }}
                  onCancel={e => e?.stopPropagation()}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={e => e.stopPropagation()}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Analytical Batch SOP Management"
        subtitle="Configure and manage standard operating procedures for analytical batch processing"
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

      <CardSection icon={<UnorderedListOutlined />} title="Analytical Batch SOPs">
        <Spin spinning={loading}>
          <EditableTable
            columns={columns}
            dataSource={analyticalBatchSops}
            rowKey="batchSopId"
            onSave={handleSaveSop}
            onDelete={handleDeleteSop}
            editable={false}
            size="small"
            onRow={record => ({
              onClick: () => handleViewDetails(record),
              style: { cursor: 'pointer' },
            })}
          />
        </Spin>
      </CardSection>
    </div>
  );
};

export default AnalyticalBatchSopManagement;
