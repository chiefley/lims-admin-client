import React, { useState, useEffect } from 'react';
import { Typography, Spin, Tag, Tooltip, Card, Alert, Button, Input, Select } from 'antd';
import {
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
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';
import ModelAdapter from '../../utils/ModelAdapter';

// Import editable table styles here to keep them scoped to this component
import '../../styles/editableTable.css';
import { message } from 'antd';

const { Text } = Typography;

// This is the component definition with the proper export
const PrepBatchSopManagement: React.FC = () => {
  const [prepBatchSops, setPrepBatchSops] = useState<PrepBatchSopSelectionRs[]>([]);
  const [selectors, setSelectors] = useState<SopMaintenanceSelectors>({
    manifestSampleTypeItems: [],
    panelGroupItems: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Handle adding a new SOP - now automatically enters edit mode
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

    // Add to the list and store the temp ID
    setPrepBatchSops(prev => [...prev, newSop]);

    // Use setTimeout to ensure the state update completes before trying to edit
    setTimeout(() => {
      // Find and click the edit button for the new row - using row-key attribute that Ant Design adds
      const newRowEditButton = document.querySelector(
        `.ant-table-row[data-row-key="${newSop.batchSopId}"] .ant-btn`
      );
      if (newRowEditButton instanceof HTMLElement) {
        newRowEditButton.click();
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

  // Handle adding a sample type to a SOP - now automatically enters edit mode
  const handleAddSample = (sopId: number) => {
    // Create a new empty sample with null values for dropdowns
    const newSample: ManifestSamplePrepBatchSopRs = {
      manifestSamplePrepBatchSopId: -Date.now(), // Temporary negative ID
      batchSopId: sopId,
      manifestSampleTypeId: null, // Start with null, let user select
      panelGroupId: null, // Start with null, let user select
      panels: '',
      effectiveDate: null, // Start with null, let user select
    };

    // Store the temporary ID for later use
    const tempId = newSample.manifestSamplePrepBatchSopId;

    // Update state to include the new sample
    setPrepBatchSops(prevSops =>
      prevSops.map(sop => {
        if (sop.batchSopId === sopId) {
          return {
            ...sop,
            manifestSamplePrepBatchSopRss: [...sop.manifestSamplePrepBatchSopRss, newSample],
          };
        }
        return sop;
      })
    );

    // Use setTimeout to ensure the state update completes before trying to edit
    setTimeout(() => {
      // Find and click the edit button for the new row - using row-key attribute that Ant Design adds
      const newRowEditButton = document.querySelector(
        `.ant-table-row[data-row-key="${tempId}"] .ant-btn`
      );
      if (newRowEditButton instanceof HTMLElement) {
        newRowEditButton.click();
      }
    }, 100);
  };

  // Handle saving a sample type
  const handleSaveSample = (sample: ManifestSamplePrepBatchSopRs, sopId: number) => {
    try {
      // Here you would call the update API
      // For now we'll just update the local state

      // Simulate async operation
      return new Promise<void>(resolve => {
        setTimeout(() => {
          message.success(`Updated sample configuration`);

          // If it's a new record (negative ID), assign a proper ID
          const isNew = sample.manifestSamplePrepBatchSopId < 0;
          const updatedSample = isNew
            ? { ...sample, manifestSamplePrepBatchSopId: Math.floor(Math.random() * 1000) + 100 }
            : sample;

          // Update the local state
          setPrepBatchSops(prevSops =>
            prevSops.map(sop => {
              if (sop.batchSopId === sopId) {
                if (isNew) {
                  // Remove the temp record and add the new one
                  return {
                    ...sop,
                    manifestSamplePrepBatchSopRss: [
                      ...sop.manifestSamplePrepBatchSopRss.filter(
                        s => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
                      ),
                      updatedSample,
                    ],
                  };
                } else {
                  // Update existing record
                  return {
                    ...sop,
                    manifestSamplePrepBatchSopRss: sop.manifestSamplePrepBatchSopRss.map(s =>
                      s.manifestSamplePrepBatchSopId === sample.manifestSamplePrepBatchSopId
                        ? updatedSample
                        : s
                    ),
                  };
                }
              }
              return sop;
            })
          );

          resolve();
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error('Error saving sample:', error);
      message.error('Failed to save sample - check console for details');
      return Promise.reject(error);
    }
  };

  // Handle deleting a sample type
  const handleDeleteSample = (sample: ManifestSamplePrepBatchSopRs) => {
    // Here you would call the delete API
    message.success(`Deleted sample configuration`);

    // Update local state to reflect the deletion
    setPrepBatchSops(prevSops =>
      prevSops.map(sop => ({
        ...sop,
        manifestSamplePrepBatchSopRss: sop.manifestSamplePrepBatchSopRss.filter(
          s => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
        ),
      }))
    );
  };

  // Show details of a SOP
  const handleViewDetails = (record: PrepBatchSopSelectionRs) => {
    message.info(`Viewing details of ${record.name} (${record.sop} v${record.version})`);
    // You could implement a detail view or keep the current modal approach
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
        const count = record.manifestSamplePrepBatchSopRss.length;
        return (
          <Tooltip title={`${count} sample type(s) configured`}>
            <Tag color="volcano">{count}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'View',
      key: 'view',
      dataIndex: 'view',
      width: 80,
      editable: false,
      render: (_: any, record: PrepBatchSopSelectionRs) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Expandable row showing the sample types and panel groups
  const expandedRowRender = (record: PrepBatchSopSelectionRs) => {
    const sampleColumns: EditableColumn[] = [
      {
        title: 'Sample Type',
        dataIndex: 'manifestSampleTypeId',
        key: 'manifestSampleTypeId',
        editable: true,
        inputType: 'select',
        editComponent: Select,
        options: selectors.manifestSampleTypeItems.map(item => ({
          value: item.id,
          label: item.label,
        })),
        render: (id: number | null) => ModelAdapter.getSampleTypeLabel(selectors, id),
        rules: [{ required: true, message: 'Please select a sample type' }],
      },
      {
        title: 'Panel Group',
        dataIndex: 'panelGroupId',
        key: 'panelGroupId',
        editable: true,
        inputType: 'select',
        editComponent: Select,
        options: selectors.panelGroupItems.map(item => ({
          value: item.id,
          label: item.label,
        })),
        render: (id: number | null) => ModelAdapter.getPanelGroupLabel(selectors, id),
        rules: [{ required: true, message: 'Please select a panel group' }],
      },
      {
        title: 'Panels',
        dataIndex: 'panels',
        key: 'panels',
        editable: false,
        render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text || '-'}</Text>,
      },
      {
        title: 'Effective Date',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        editable: true,
        inputType: 'date',
        render: (text: string | null) => {
          if (!text) return <span className="data-placeholder">Not set</span>;

          try {
            return new Date(text).toLocaleDateString();
          } catch (e) {
            return 'Invalid date';
          }
        },
        rules: [{ required: true, message: 'Please select an effective date' }],
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
          <EditableTable
            columns={sampleColumns}
            dataSource={record.manifestSamplePrepBatchSopRss}
            rowKey="manifestSamplePrepBatchSopId"
            pagination={false}
            size="small"
            onSave={updatedRecord =>
              handleSaveSample(updatedRecord as ManifestSamplePrepBatchSopRs, record.batchSopId)
            }
            onDelete={handleDeleteSample as any}
          />
        )}
      </Card>
    );
  };

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
            expandable={{
              expandedRowRender,
              expandRowByClick: false,
            }}
            onSave={handleSaveSop as any}
            onDelete={handleDeleteSop as any}
            onAdd={handleAddSop}
            addButtonText="Add New SOP"
          />
        </Spin>
      </CardSection>
    </div>
  );
};

// Make sure to export the component as a default export
export default PrepBatchSopManagement;
