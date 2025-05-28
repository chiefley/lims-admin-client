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
  editing = false, // Now controlled by parent edit mode
}) => {
  // Since instrumentTypeAnalytes don't have an Active flag, the showInactive prop isn't applicable
  // But we keep it for API consistency with other tabs
  const filteredAnalytes = useMemo(() => {
    return analytes;
  }, [analytes]);

  // Preprocess analytes to add a unique key field since they don't have a single ID
  const analytesWithKey = useMemo(() => {
    return filteredAnalytes.map((analyte, index) => ({
      ...analyte,
      // Add a composite key field that can be used as rowKey
      key: `${analyte.instrumentTypeId}_${analyte.analyteId}_${index}`,
    }));
  }, [filteredAnalytes]);

  // Handle adding a new analyte
  const handleAddAnalyte = () => {
    if (!editing) {
      message.warning('Cannot add analytes - not in edit mode');
      return;
    }

    // Create new analyte with default values
    const newAnalyte: InstrumentTypeAnalyteRs = {
      instrumentTypeId: instrumentTypeId,
      analyteId: 0, // Initialize with 0 instead of null
      analyteAlias: '', // Field for AnalyteAlias
    };

    // Add to the analytes array and notify parent immediately
    const updatedAnalytes = [...analytes, newAnalyte];
    onChange(updatedAnalytes);

    console.log('➕ Added new analyte, notifying parent');
  };

  // Handle saving an analyte with enhanced validation
  const handleSaveAnalyte = async (
    analyte: InstrumentTypeAnalyteRs & { key: string }
  ): Promise<void> => {
    if (!editing) {
      message.warning('Cannot save changes - not in edit mode');
      return Promise.reject('Not in edit mode');
    }

    // Enhanced validation
    const errors: string[] = [];

    if (!analyte.analyteId) {
      errors.push('Analyte selection is required');
    }

    if (!analyte.analyteAlias?.trim()) {
      errors.push('Analyte alias is required');
    }

    if (analyte.analyteAlias && analyte.analyteAlias.length > 150) {
      errors.push('Analyte alias cannot exceed 150 characters');
    }

    // Check for duplicate analyte selections within this instrument type
    const duplicateAnalyte = analytes.find(
      a =>
        !(a.instrumentTypeId === analyte.instrumentTypeId && a.analyteId === analyte.analyteId) &&
        a.analyteId === analyte.analyteId
    );
    if (duplicateAnalyte && analyte.analyteId && analyte.analyteId > 0) {
      errors.push('This analyte is already configured for this instrument type');
    }

    // Check for duplicate aliases within this instrument type
    const duplicateAlias = analytes.find(
      a =>
        !(a.instrumentTypeId === analyte.instrumentTypeId && a.analyteId === analyte.analyteId) &&
        a.analyteAlias?.trim().toLowerCase() === analyte.analyteAlias?.trim().toLowerCase()
    );
    if (duplicateAlias && analyte.analyteAlias?.trim()) {
      errors.push('Analyte alias must be unique within this instrument type');
    }

    if (errors.length > 0) {
      message.error(`Validation failed: ${errors.join(', ')}`);
      return Promise.reject(errors.join(', '));
    }

    console.log('💾 Saving analyte changes and notifying parent');

    // Clean up the analyte object (remove the key field)
    const cleanAnalyte: InstrumentTypeAnalyteRs = {
      instrumentTypeId: analyte.instrumentTypeId,
      analyteId: analyte.analyteId || 0,
      analyteAlias: analyte.analyteAlias?.trim() || '',
    };

    // For analytes, we always add as new since they don't have a single primary key
    // Instead, we need to replace the entire analytes array
    let updatedAnalytes = [...analytes, cleanAnalyte];

    onChange(updatedAnalytes);

    // Get the analyte name from compounds selectors
    const analyteName =
      selectors.compounds?.find(c => c.id === analyte.analyteId)?.label || 'Unknown';
    message.success(`Analyte "${analyteName}" saved`);

    return Promise.resolve();
  };

  // Handle deleting an analyte
  const handleDeleteAnalyte = (analyte: InstrumentTypeAnalyteRs & { key: string }) => {
    if (!editing) {
      message.warning('Cannot delete analytes - not in edit mode');
      return;
    }

    console.log('🗑️ Deleting analyte and notifying parent');

    // Remove the analyte from the array using the key to find the exact match
    const analyteIndex = analytesWithKey.findIndex(a => a.key === analyte.key);
    if (analyteIndex >= 0) {
      const updatedAnalytes = [...analytes];
      updatedAnalytes.splice(analyteIndex, 1);
      onChange(updatedAnalytes);
    }

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
      editable: editing,
      inputType: 'select',
      options:
        selectors.compounds?.map(compound => ({
          value: compound.id,
          label: compound.label,
        })) || [],
      rules: [{ required: true, message: 'Please select an analyte' }],
      render: (analyteId: number, record: InstrumentTypeAnalyteRs) => {
        if (!analyteId) {
          return <span className="data-placeholder">Select analyte...</span>;
        }

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
      editable: editing,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter an analyte alias' },
        { max: 150, message: 'Alias cannot exceed 150 characters' },
      ],
      render: (text: string) => text || <span className="data-placeholder">Enter alias...</span>,
    },
  ];

  // Custom row class to highlight validation errors
  const getRowClassName = (record: InstrumentTypeAnalyteRs & { key: string }) => {
    if (editing && (!record.analyteId || !record.analyteAlias?.trim())) {
      return 'validation-error-row';
    }
    return '';
  };

  // Check for validation errors in the current data
  const hasValidationErrors =
    editing && analytesWithKey.some(a => !a.analyteId || !a.analyteAlias?.trim());

  // Check for duplicate aliases
  const aliases = analytesWithKey.map(a => a.analyteAlias?.trim().toLowerCase()).filter(Boolean);
  const hasDuplicateAliases = aliases.length !== new Set(aliases).size;

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
            editing
              ? 'No analytes have been configured for this instrument type. Click "Add Analyte" to create one.'
              : 'No analytes have been configured for this instrument type.'
          }
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
          rowClassName={getRowClassName}
          editable={editing}
          autoSaveOnUnmount={false} // Disable auto-save since we're managing edit mode at page level
        />
      )}

      {editing && (hasValidationErrors || hasDuplicateAliases) && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#cf1322',
          }}
        >
          ⚠️ {hasValidationErrors && 'Some analytes are missing required information. '}
          {hasDuplicateAliases && 'Duplicate analyte aliases detected. '}
          Please fix all validation errors.
        </div>
      )}
    </div>
  );
};

export default AnalytesTab;
