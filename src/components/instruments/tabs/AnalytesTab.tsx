import React, { useMemo } from 'react';
import { Button, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { InstrumentTypeAnalyteRs, ConfigurationMaintenanceSelectors } from '../../../models/types';
import CardSection from '../../common/CardSection';
import EditableTable, { EditableColumn } from '../../tables/EditableTable';
import { stylePresets } from '../../../config/theme';

interface AnalytesTabProps {
  analytes: InstrumentTypeAnalyteRs[];
  instrumentTypeId: number;
  selectors: ConfigurationMaintenanceSelectors;
  onChange: (analytes: InstrumentTypeAnalyteRs[]) => void;
  showInactive?: boolean;
  editing?: boolean;
}

const AnalytesTab: React.FC<AnalytesTabProps> = ({
  analytes,
  instrumentTypeId,
  selectors,
  onChange,
  showInactive = false,
  editing = true,
}) => {
  // Filter analytes based on active status
  const filteredAnalytes = useMemo(() => {
    if (showInactive) {
      return analytes;
    }
    return analytes.filter(analyte => analyte.active !== false);
  }, [analytes, showInactive]);

  // Handle adding a new analyte
  const handleAddAnalyte = () => {
    if (!editing) return;

    // Create new analyte with default values
    const newAnalyte: InstrumentTypeAnalyteRs = {
      instrumentTypeAnalyteId: -Date.now(), // Temporary negative ID
      instrumentTypeId: instrumentTypeId,
      analyteId: 0, // Initialize with 0 instead of null
      analyteAlias: '', // Field for AnalyteAlias
      active: true, // New analytes are active by default
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

    // Ensure active property is boolean
    const updatedAnalyte = {
      ...analyte,
      active:
        typeof analyte.active === 'string' ? analyte.active === 'true' : analyte.active !== false,
    };

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // Get the analyte name from compounds selectors
        const analyteName =
          selectors.compounds?.find(c => c.id === analyte.analyteId)?.label || 'Unknown';
        message.success(`Analyte "${analyteName}" saved`);

        // Update the analytes array
        if ((analyte.instrumentTypeAnalyteId || 0) < 0) {
          // For new analytes (negative ID)
          const filteredAnalytes = analytes.filter(
            a => a.instrumentTypeAnalyteId !== analyte.instrumentTypeAnalyteId
          );
          onChange([...filteredAnalytes, updatedAnalyte]);
        } else {
          // For existing analytes
          const updatedAnalytes = analytes.map(a =>
            a.instrumentTypeAnalyteId === analyte.instrumentTypeAnalyteId ? updatedAnalyte : a
          );
          onChange(updatedAnalytes);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting an analyte
  const handleDeleteAnalyte = (analyte: InstrumentTypeAnalyteRs) => {
    // Only allow deletion of temporary (negative ID) analytes
    if ((analyte.instrumentTypeAnalyteId || 0) >= 0) {
      message.error('Cannot delete existing analyte. Set it to inactive instead.');
      return;
    }

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
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: true,
      inputType: 'select',
      inputProps: {
        style: { width: '100%' },
      },
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      render: (value: boolean) => (value !== false ? 'Active' : 'Inactive'),
    },
  ];

  // Custom row class to visually indicate inactive analytes
  const getRowClassName = (record: InstrumentTypeAnalyteRs) => {
    return record.active === false ? 'inactive-row' : '';
  };

  // Only allow deletion of temporary (negative ID) analytes
  const canDelete = (record: InstrumentTypeAnalyteRs) => (record.instrumentTypeAnalyteId || 0) < 0;

  return (
    <div>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnalyte}>
            Add Analyte
          </Button>
        </div>
      )}

      {filteredAnalytes.length === 0 ? (
        <Alert
          message="No Analytes"
          description={
            showInactive
              ? 'No analytes have been configured for this instrument type.'
              : "No active analytes found. Use 'Show Inactive' to view inactive analytes."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={filteredAnalytes}
          rowKey="instrumentTypeAnalyteId"
          pagination={false}
          size="small"
          onSave={handleSaveAnalyte}
          onDelete={handleDeleteAnalyte}
          editable={editing}
          rowClassName={getRowClassName}
        />
      )}
    </div>
  );
};

export default AnalytesTab;
