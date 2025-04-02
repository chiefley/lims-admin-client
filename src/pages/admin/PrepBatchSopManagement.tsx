import React, { useState, useEffect } from 'react';
import { Typography, Spin, Tag, Tooltip, Alert, Button, Input, Popconfirm, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ExperimentOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { fetchBatchSopSelections } from '../../api/endpoints/sopService';
import { PrepBatchSopSelectionRs } from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';

// Import editable table styles here to keep them scoped to this component
import '../../styles/editableTable.css';
import { message } from 'antd';

const { Text } = Typography;

const PrepBatchSopManagement: React.FC = () => {
  const navigate = useNavigate();
  const [prepBatchSops, setPrepBatchSops] = useState<PrepBatchSopSelectionRs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load prep batch SOPs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sopsData = await fetchBatchSopSelections();
        setPrepBatchSops(sopsData);
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

  // Handle adding a new SOP
  const handleAddSop = (defaultValues: Partial<PrepBatchSopSelectionRs> = {}) => {
    // Create a new SOP with default values
    const newSop: PrepBatchSopSelectionRs = {
      batchSopId: -Date.now(), // Temporary negative ID
      name: '',
      sop: '',
      version: '',
      sopGroup: '',
      labId: 1001, // Default lab ID from your config
      $type: 'PrepBatchSopSelectionRs',
      manifestSamplePrepBatchSopRss: [],
      ...defaultValues,
    };

    // Add to the list
    setPrepBatchSops(prev => [...prev, newSop]);

    // Use setTimeout to ensure the state update completes before trying to edit
    setTimeout(() => {
      // Find and click the edit button for the new row
      const newRowEditButton = document.querySelector(
        `.ant-table-row[data-row-key="${newSop.batchSopId}"] .ant-btn-text .anticon-edit`
      );
      if (newRowEditButton instanceof HTMLElement) {
        (newRowEditButton.closest('button') as HTMLElement).click();
      }
    }, 100);
  };

  // Handle saving a batch SOP record
  const handleSaveSop = (record: PrepBatchSopSelectionRs) => {
    // Here you would call the update API
    // For now we'll just update the local state

    // Simulate async operation
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success(`Updated Prep SOP: ${record.name}`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = record.batchSopId < 0;
        const updatedRecord = isNew
          ? { ...record, batchSopId: Math.floor(Math.random() * 1000) + 100 }
          : record;

        // Update the local state
        setPrepBatchSops(prevSops => {
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
  const handleDeleteSop = (record: PrepBatchSopSelectionRs) => {
    // Here you would call the delete API
    message.success(`Deleted Prep SOP: ${record.name}`);

    // Update local state to reflect the deletion
    setPrepBatchSops(prevSops => prevSops.filter(sop => sop.batchSopId !== record.batchSopId));
  };

  // Handle navigation to the detail page
  const handleViewDetails = (record: PrepBatchSopSelectionRs) => {
    navigate(`/admin/prep-batch-sop/${record.batchSopId}`);
  };

  // Table columns for the main prep batch SOP list
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      editComponent: Input,
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: PrepBatchSopSelectionRs, b: PrepBatchSopSelectionRs) =>
        a.name.localeCompare(b.name),
      rules: [
        { required: true, message: 'Please enter the Prep SOP name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'SOP',
      dataIndex: 'sop',
      key: 'sop',
      editable: true,
      inputType: 'text',
      editComponent: Input,
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
      editable: true,
      inputType: 'text',
      editComponent: Input,
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
      editable: true,
      inputType: 'text',
      editComponent: Input,
      rules: [
        { required: true, message: 'Please enter the SOP group' },
        { max: 50, message: 'SOP Group cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Sample Types',
      key: 'sampleTypes',
      dataIndex: 'sampleTypes',
      editable: false,
      render: (_: any, record: PrepBatchSopSelectionRs) => {
        const count = record.manifestSamplePrepBatchSopRss?.length || 0;
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
      dataIndex: 'actions',
      width: 120,
      render: (_: any, record: PrepBatchSopSelectionRs) => {
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
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                className="edit-button"
                onClick={e => {
                  e.stopPropagation();
                  // Find and click the edit button that's part of the editable table
                  const editButton = document
                    .querySelector(
                      `.ant-table-row[data-row-key="${record.batchSopId}"] .ant-btn-text .anticon-edit`
                    )
                    ?.closest('button');
                  if (editButton instanceof HTMLElement) {
                    editButton.click();
                  }
                }}
              />
            </Tooltip>
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
          </Space>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Prep Batch SOP Management"
        subtitle="Configure and manage standard operating procedures for sample preparation batch processing"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddSop()}>
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
          <EditableTable
            columns={columns}
            dataSource={prepBatchSops}
            rowKey="batchSopId"
            onSave={handleSaveSop}
            onDelete={handleDeleteSop}
            onAdd={handleAddSop}
            addButtonText="Add New SOP"
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

export default PrepBatchSopManagement;
