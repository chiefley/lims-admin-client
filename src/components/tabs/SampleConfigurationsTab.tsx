import React from 'react';
import { Button, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  PrepBatchSopRs,
  SopMaintenanceSelectors,
  ManifestSamplePrepBatchSopRs,
} from '../../models/types';
import CardSection from '../common/CardSection';
import EditableTable, { EditableColumn } from '../tables/EditableTable';
import { stylePresets } from '../../config/theme';
import dayjs from 'dayjs';
import { Typography } from 'antd';

interface SampleConfigurationsTabProps {
  sopData: PrepBatchSopRs;
  selectors: SopMaintenanceSelectors;
  editing: boolean;
  onSampleConfigChange: (samples: ManifestSamplePrepBatchSopRs[]) => void;
}

/**
 * Component for displaying and editing SOP sample type configurations
 */
const SampleConfigurationsTab: React.FC<SampleConfigurationsTabProps> = ({
  sopData,
  selectors,
  editing,
  onSampleConfigChange,
}) => {
  // Handle adding a new sample type configuration
  const handleAddSampleType = () => {
    // Create new sample type with default values
    const newSample = {
      manifestSamplePrepBatchSopId: -Date.now(), // Using negative ID for temporary records
      batchSopId: sopData.batchSopId,
      manifestSampleTypeId: null,
      panelGroupId: null,
      panels: '',
      effectiveDate: null,
    };

    // Update the sample configurations by calling the parent handler
    const updatedSamples = [...sopData.manifestSamplePrepBatchSopRss, newSample];
    onSampleConfigChange(updatedSamples);

    // Use setTimeout to ensure the state update completes before trying to edit
    setTimeout(() => {
      // Find and click the edit button for the new row
      const newRowEditButton = document.querySelector(
        `.ant-table-row[data-row-key="${newSample.manifestSamplePrepBatchSopId}"] .ant-btn`
      );
      if (newRowEditButton instanceof HTMLElement) {
        newRowEditButton.click();
      }
    }, 100);
  };

  // Handle saving a sample type
  const handleSaveSampleType = (sample: ManifestSamplePrepBatchSopRs) => {
    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Sample type configuration saved');

        // If it's a new record (negative ID), assign a proper ID
        const isNew = sample.manifestSamplePrepBatchSopId < 0;
        const updatedSample = isNew
          ? { ...sample, manifestSamplePrepBatchSopId: Math.floor(Math.random() * 1000) + 100 }
          : sample;

        // Update the parent component's state
        const updatedSamples = isNew
          ? [
              ...sopData.manifestSamplePrepBatchSopRss.filter(
                s => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
              ),
              updatedSample,
            ]
          : sopData.manifestSamplePrepBatchSopRss.map(s =>
              s.manifestSamplePrepBatchSopId === sample.manifestSamplePrepBatchSopId
                ? updatedSample
                : s
            );

        onSampleConfigChange(updatedSamples);
        resolve();
      }, 500);
    });
  };

  // Handle deleting a sample type
  const handleDeleteSampleType = (sample: ManifestSamplePrepBatchSopRs) => {
    message.success('Sample type configuration deleted');

    // Update by filtering out the deleted sample
    const updatedSamples = sopData.manifestSamplePrepBatchSopRss.filter(
      s => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
    );

    onSampleConfigChange(updatedSamples);
  };

  // Define columns for the sample types table
  const sampleColumns: EditableColumn[] = [
    {
      title: 'Sample Type',
      dataIndex: 'manifestSampleTypeId',
      key: 'manifestSampleTypeId',
      editable: true,
      inputType: 'select',
      options: selectors.manifestSampleTypeItems?.map((item: any) => ({
        value: item.id,
        label: item.label,
      })),
      render: (id: number | null) => {
        const item = selectors.manifestSampleTypeItems?.find((item: any) => item.id === id);
        return item ? item.label : 'Not Selected';
      },
      rules: [{ required: true, message: 'Please select a sample type' }],
    },
    {
      title: 'Panel Group',
      dataIndex: 'panelGroupId',
      key: 'panelGroupId',
      editable: true,
      inputType: 'select',
      options: selectors.panelGroupItems?.map((item: any) => ({
        value: item.id,
        label: item.label,
      })),
      render: (id: number | null) => {
        const item = selectors.panelGroupItems?.find((item: any) => item.id === id);
        return item ? item.label : 'Not Selected';
      },
      rules: [{ required: true, message: 'Please select a panel group' }],
    },
    {
      title: 'Panels',
      dataIndex: 'panels',
      key: 'panels',
      editable: false,
      render: (text: string) => (
        <Typography.Text ellipsis={{ tooltip: text }}>{text || '-'}</Typography.Text>
      ),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      editable: true,
      inputType: 'date',
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return 'Invalid date';
        }
      },
      rules: [{ required: true, message: 'Please select an effective date' }],
    },
  ];

  return (
    <CardSection title="Sample Types and Panel Groups" style={stylePresets.contentCard}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSampleType}>
            Add Sample Type
          </Button>
        </div>
      )}

      {sopData.manifestSamplePrepBatchSopRss?.length === 0 ? (
        <Alert
          message="No Sample Types Configured"
          description={
            editing
              ? "Click 'Add Sample Type' to configure sample types for this SOP."
              : "This SOP doesn't have any sample types configured."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={sampleColumns}
          dataSource={sopData.manifestSamplePrepBatchSopRss}
          rowKey="manifestSamplePrepBatchSopId"
          pagination={false}
          size="small"
          onSave={handleSaveSampleType}
          onDelete={handleDeleteSampleType}
          editable={editing}
        />
      )}
    </CardSection>
  );
};

export default SampleConfigurationsTab;
