import React, { useMemo } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Alert, message } from 'antd';

import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';

import { InstrumentTypeAnalyteRs } from './types';

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
  // Since instrumentTypeAnalytes don't have an Active flag, the showInactive prop isn't applicable
  // But we keep it for API consistency with other tabs
  const filteredAnalytes = useMemo(() => {
    return analytes;
  }, [analytes]);

  // Preprocess analytes to add a unique key field since they don't have a single ID
  const analytesWithKey = useMemo(() => {
    return filteredAnalytes.map(analyte => ({
      ...analyte,
      // Add a composite key field that can be used as rowKey
      key: `${analyte.instrumentTypeId}_${analyte.analyteId}`,
    }));
  }, [filteredAnalytes]);

  // Handle adding a new analyte
  const handleAddAnalyte = () => {
    if (!editing) return;

    // Create new analyte with default values
    const newAnalyte: InstrumentTypeAnalyteRs & { key: string } = {
      instrumentTypeId: instrumentTypeId,
      analyteId: 0, // Initialize with 0 instead of null
      analyteAlias: '', // Field for AnalyteAlias
      key: `${instrumentTypeId}_new_${Date.now()}`, // Generate a temporary unique key
    };

    // Add to the analytes array
    const updatedAnalytes = [...analytes, newAnalyte];
    onChange(updatedAnalytes);
  };

  // Handle saving an analyte
  const handleSaveAnalyte = (analyte: InstrumentTypeAnalyteRs & { key: string }) => {
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

        // Update the analytes array
        // For instrument type analytes, we use the compound key (instrumentTypeId, analyteId, analyteAlias)
        // to identify the record
        const existingIndex = analytes.findIndex(
          a => a.instrumentTypeId === analyte.instrumentTypeId && a.analyteId === analyte.analyteId
        );

        if (existingIndex >= 0) {
          // Update existing record
          const updatedAnalytes = [...analytes];
          updatedAnalytes[existingIndex] = analyte;
          onChange(updatedAnalytes);
        } else {
          // Add new record
          onChange([...analytes, analyte]);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting an analyte
  // For instrument type analytes, we implement hard deletion since there's no Active flag
  const handleDeleteAnalyte = (analyte: InstrumentTypeAnalyteRs & { key: string }) => {
    // Remove the analyte from the array
    const updatedAnalytes = analytes.filter(
      a => !(a.instrumentTypeId === analyte.instrumentTypeId && a.analyteId === analyte.analyteId)
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
          description="No analytes have been configured for this instrument type."
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={analytesWithKey}
          rowKey="key"
          pagination={false}
          size="small"
          onSave={handleSaveAnalyte}
          onDelete={handleDeleteAnalyte}
          editable={editing}
        />
      )}
    </div>
  );
};

export default AnalytesTab;
