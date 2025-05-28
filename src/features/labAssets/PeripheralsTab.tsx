import React, { useMemo } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Alert, message } from 'antd';

import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';

import { InstrumentRs, InstrumentPeripheralRs } from './types';

interface PeripheralsTabProps {
  instrument: InstrumentRs;
  selectors: ConfigurationMaintenanceSelectors;
  onChange: (peripherals: InstrumentPeripheralRs[]) => void;
  showInactive?: boolean;
  editing?: boolean;
}

const PeripheralsTab: React.FC<PeripheralsTabProps> = ({
  instrument,
  selectors,
  onChange,
  showInactive = false,
  editing = false, // Now controlled by parent edit mode
}) => {
  // Make sure instrumentPeripheralRss is always an array
  const peripherals = instrument.instrumentPeripheralRss || [];

  // Since peripherals don't have an Active flag, the showInactive prop isn't applicable
  // But we keep it for API consistency with other tabs
  const filteredPeripherals = useMemo(() => {
    return peripherals;
  }, [peripherals]);

  // Handle adding a new peripheral
  const handleAddPeripheral = () => {
    if (!editing) {
      message.warning('Cannot add peripherals - not in edit mode');
      return;
    }

    // Create new peripheral with default values
    const newPeripheral: InstrumentPeripheralRs = {
      instrumentPeripheralId: -Date.now(), // Temporary negative ID
      instrumentId: instrument.instrumentId,
      durableLabAssetId: null,
      peripheralType: '',
    };

    // Add to the peripherals array
    const updatedPeripherals = [...peripherals, newPeripheral];
    onChange(updatedPeripherals);
  };

  // Handle saving a peripheral with enhanced validation
  const handleSavePeripheral = async (peripheral: InstrumentPeripheralRs): Promise<void> => {
    if (!editing) {
      message.warning('Cannot save changes - not in edit mode');
      return Promise.reject('Not in edit mode');
    }

    // Enhanced validation
    const errors: string[] = [];

    if (!peripheral.durableLabAssetId) {
      errors.push('Lab asset selection is required');
    }

    if (!peripheral.peripheralType?.trim()) {
      errors.push('Peripheral type is required');
    }

    if (peripheral.peripheralType && peripheral.peripheralType.length > 250) {
      errors.push('Peripheral type cannot exceed 250 characters');
    }

    // Check for duplicate combinations within this instrument
    const duplicateCombo = peripherals.find(
      p =>
        p.instrumentPeripheralId !== peripheral.instrumentPeripheralId &&
        p.instrumentId === peripheral.instrumentId &&
        p.peripheralType?.trim().toLowerCase() === peripheral.peripheralType?.trim().toLowerCase()
    );
    if (duplicateCombo && peripheral.peripheralType?.trim()) {
      errors.push('This peripheral type is already configured for this instrument');
    }

    if (errors.length > 0) {
      message.error(`Validation failed: ${errors.join(', ')}`);
      return Promise.reject(errors.join(', '));
    }

    // Clean up the peripheral object
    const cleanPeripheral: InstrumentPeripheralRs = {
      instrumentPeripheralId: peripheral.instrumentPeripheralId,
      instrumentId: peripheral.instrumentId,
      durableLabAssetId: peripheral.durableLabAssetId,
      peripheralType: peripheral.peripheralType?.trim() || null,
    };

    // Get the asset name from selectors for the success message
    const assetName =
      selectors.durableLabAssets?.find(a => a.id === peripheral.durableLabAssetId)?.label ||
      'Unknown';

    // Update the peripherals array
    let updatedPeripherals;
    if (peripheral.instrumentPeripheralId < 0) {
      // For new peripherals (negative ID)
      const filteredPeripherals = peripherals.filter(
        p => p.instrumentPeripheralId !== peripheral.instrumentPeripheralId
      );
      updatedPeripherals = [...filteredPeripherals, cleanPeripheral];
    } else {
      // For existing peripherals
      updatedPeripherals = peripherals.map(p =>
        p.instrumentPeripheralId === peripheral.instrumentPeripheralId ? cleanPeripheral : p
      );
    }

    onChange(updatedPeripherals);
    message.success(`Peripheral "${assetName}" saved`);

    return Promise.resolve();
  };

  // Handle deleting a peripheral
  const handleDeletePeripheral = (peripheral: InstrumentPeripheralRs) => {
    if (!editing) {
      message.warning('Cannot delete peripherals - not in edit mode');
      return;
    }

    // Update by filtering out the deleted peripheral
    const updatedPeripherals = peripherals.filter(
      p => p.instrumentPeripheralId !== peripheral.instrumentPeripheralId
    );

    onChange(updatedPeripherals);

    // Get the asset name from selectors
    const assetName =
      selectors.durableLabAssets?.find(a => a.id === peripheral.durableLabAssetId)?.label ||
      'Unknown';
    message.success(`Peripheral "${assetName}" deleted`);
  };

  // Define columns for the peripherals table
  const columns: EditableColumn[] = [
    {
      title: 'Lab Asset',
      dataIndex: 'durableLabAssetId',
      key: 'durableLabAssetId',
      editable: editing,
      inputType: 'select',
      options:
        selectors.durableLabAssets?.map(asset => ({
          value: asset.id,
          label: asset.label,
        })) || [],
      rules: [{ required: true, message: 'Please select a lab asset' }],
      render: (assetId: number) => {
        if (!assetId) {
          return <span className="data-placeholder">Select asset...</span>;
        }

        const asset = selectors.durableLabAssets?.find(a => a.id === assetId);
        return asset ? asset.label : `Asset ID: ${assetId}`;
      },
    },
    {
      title: 'Peripheral Type',
      dataIndex: 'peripheralType',
      key: 'peripheralType',
      editable: editing,
      inputType: 'select',
      // Use a custom component that allows both selection from a list and custom input
      // This is a combobox control as specified in the requirements
      inputProps: {
        mode: 'combobox', // This makes it a combobox (allows both selection and custom input)
        allowClear: true,
        showSearch: true,
        placeholder: 'Select or enter a peripheral type',
      },
      options:
        selectors.peripheralTypes?.map(type => ({
          value: type.label, // Use the label as the value since peripheralType is a string
          label: type.label,
        })) || [],
      rules: [
        { required: true, message: 'Please enter a peripheral type' },
        { max: 250, message: 'Type cannot exceed 250 characters' },
      ],
      render: (text: string) => text || <span className="data-placeholder">Enter type...</span>,
    },
  ];

  // Custom row class to highlight validation errors
  const getRowClassName = (record: InstrumentPeripheralRs) => {
    if (editing && (!record.durableLabAssetId || !record.peripheralType?.trim())) {
      return 'validation-error-row';
    }
    return '';
  };

  // Check for validation errors in the current data
  const hasValidationErrors =
    editing && filteredPeripherals.some(p => !p.durableLabAssetId || !p.peripheralType?.trim());

  // Check for duplicate peripheral types
  const peripheralTypes = filteredPeripherals
    .map(p => p.peripheralType?.trim().toLowerCase())
    .filter(Boolean);
  const hasDuplicateTypes = peripheralTypes.length !== new Set(peripheralTypes).size;

  return (
    <div style={{ padding: '8px 0' }}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPeripheral}>
            Add Peripheral
          </Button>
        </div>
      )}

      {filteredPeripherals.length === 0 ? (
        <Alert
          message="No Peripherals"
          description={
            editing
              ? 'No peripherals have been configured for this instrument. Click "Add Peripheral" to create one.'
              : 'No peripherals have been configured for this instrument.'
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={filteredPeripherals}
          rowKey="instrumentPeripheralId"
          pagination={false}
          size="small"
          onSave={handleSavePeripheral}
          onDelete={handleDeletePeripheral}
          editable={editing}
          rowClassName={getRowClassName}
          autoSaveOnUnmount={false} // Disable auto-save since we're managing edit mode at page level
        />
      )}

      {editing && (hasValidationErrors || hasDuplicateTypes) && (
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
          ⚠️ {hasValidationErrors && 'Some peripherals are missing required information. '}
          {hasDuplicateTypes && 'Duplicate peripheral types detected. '}
          Please fix all validation errors.
        </div>
      )}
    </div>
  );
};

export default PeripheralsTab;
