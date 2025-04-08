import React from 'react';
import { Button, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { InstrumentTypeAnalyteRs, SopMaintenanceSelectors } from '../../../models/types';
import CardSection from '../../common/CardSection';
import EditableTable, { EditableColumn } from '../../tables/EditableTable';
import { stylePresets } from '../../../config/theme';

interface AnalytesTabProps {
  analytes: InstrumentTypeAnalyteRs[];
  instrumentTypeId: number;
  selectors: SopMaintenanceSelectors;
  onChange: (analytes: InstrumentTypeAnalyteRs[]) => void;
}

const AnalytesTab: React.FC<AnalytesTabProps> = ({
  analytes,
  instrumentTypeId,
  selectors,
  onChange,
}) => {
  // Handle adding a new analyte
  const handleAddAnalyte = () => {
    // Create new analyte with default values
    const newAnalyte: InstrumentTypeAnalyteRs = {
      instrumentTypeAnalyteId: -Date.now(), // Temporary negative ID
      instrumentTypeId: instrumentTypeId,
      analyteId: 0, // Initialize with 0 instead of null
      analyteAlias: '', // New field for AnalyteAlias
    };

    // Add to the analytes array
    const updatedAnalytes = [...analytes, newAnalyte];
    onChange(updatedAnalytes);
  };

  // Handle saving an analyte
  const handleSaveAnalyte = (analyte: InstrumentTypeAnalyteRs) => {
    // Validate required fields
    if (!analyte.analyteId) {
      message.error('Please select an analyte');
      return Promise.reject('Please select an analyte');
    }

    if (!analyte.analyteAlias) {
      message.error('Please enter an analyte alias');
      return Promise.reject('Please enter an analyte alias');
    }

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // Get the analyte name from compounds selectors
        const analyteName =
          selectors.compounds?.find(c => c.id === analyte.analyteId)?.label || 'Unknown';
        message.success(`Analyte "${analyteName}" saved`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = (analyte.instrumentTypeAnalyteId || 0) < 0;
        const finalAnalyte = isNew
          ? {
              ...analyte,
              instrumentTypeAnalyteId: Math.floor(Math.random() * 1000) + 100,
              analyteName,
            }
          : { ...analyte, analyteName };

        // Update the analytes array
        const updatedAnalytes = isNew
          ? [
              ...analytes.filter(
                a => a.instrumentTypeAnalyteId !== analyte.instrumentTypeAnalyteId
              ),
              finalAnalyte,
            ]
          : analytes.map(a =>
              a.instrumentTypeAnalyteId === analyte.instrumentTypeAnalyteId ? finalAnalyte : a
            );

        onChange(updatedAnalytes);
        resolve();
      }, 500);
    });
  };

  // Handle deleting an analyte
  const handleDeleteAnalyte = (analyte: InstrumentTypeAnalyteRs) => {
    // Update by filtering out the deleted analyte
    const updatedAnalytes = analytes.filter(
      a => a.instrumentTypeAnalyteId !== analyte.instrumentTypeAnalyteId
    );

    onChange(updatedAnalytes);

    // Get the analyte name from compounds selectors
    const analyteName =
      selectors.compounds?.find(c => c.id === analyte.analyteId)?.label || 'Unknown';
    message.success(`Analyte "${analyteName}" deleted`);
  };

  // Define columns for the analytes table
  const columns: EditableColumn[] = [
    {
      title: 'Analyte',
      dataIndex: 'analyteId',
      key: 'analyteId',
      editable: true,
      inputType: 'select',
      options:
        selectors.compounds?.map(compound => ({
          value: compound.id,
          label: compound.label,
        })) || [],
      rules: [{ required: true, message: 'Please select an analyte' }],
      render: (analyteId: number, record: InstrumentTypeAnalyteRs) => {
        // Try to get the name from the record first, then from selectors
        if (record.analyteName) return record.analyteName;

        const compound = selectors.compounds?.find(c => c.id === analyteId);
        return compound ? compound.label : `Analyte ID: ${analyteId}`;
      },
    },
    {
      title: 'Analyte Alias',
      dataIndex: 'analyteAlias',
      key: 'analyteAlias',
      editable: true,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter an analyte alias' },
        { max: 150, message: 'Alias cannot exceed 150 characters' },
      ],
      render: (text: string) => text || '-',
    },
  ];

  return (
    <CardSection title="Instrument Type Analytes" style={stylePresets.contentCard}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnalyte}>
          Add Analyte
        </Button>
      </div>

      {analytes.length === 0 ? (
        <Alert
          message="No Analytes"
          description="No analytes have been configured for this instrument type."
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={analytes}
          rowKey="instrumentTypeAnalyteId"
          pagination={false}
          size="small"
          onSave={handleSaveAnalyte}
          onDelete={handleDeleteAnalyte}
          editable={true}
        />
      )}
    </CardSection>
  );
};

export default AnalytesTab;
