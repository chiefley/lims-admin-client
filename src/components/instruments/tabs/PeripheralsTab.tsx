import React, { useMemo } from 'react';
import { Button, Alert, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  InstrumentRs,
  InstrumentPeripheralRs,
  ConfigurationMaintenanceSelectors,
} from '../../../models/types';
import EditableTable, { EditableColumn } from '../../tables/EditableTable';
import { stylePresets } from '../../../config/theme';

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
  editing = true,
}) => {
  // Make sure instrumentPeripherals is always an array
  const peripherals = instrument.instrumentPeripherals || [];

  // Since peripherals don't have an Active flag, the showInactive prop isn't applicable
  // But we keep it for API consistency with other tabs
  const filteredPeripherals = useMemo(() => {
    return peripherals;
  }, [peripherals]);

  // Handle adding a new peripheral
  const handleAddPeripheral = () => {
    if (!editing) return;

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

  // Handle saving a peripheral
  const handleSavePeripheral = (peripheral: InstrumentPeripheralRs) => {
    // Validate required fields
    if (!peripheral.durableLabAssetId) {
      message.error('Please select a durable lab asset');
      return Promise.reject('Please select a durable lab asset');
    }

    if (!peripheral.peripheralType) {
      message.error('Please enter a peripheral type');
      return Promise.reject('Please enter a peripheral type');
    }

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // Get the asset name from selectors
        const assetName =
          selectors.durableLabAssets?.find(a => a.id === peripheral.durableLabAssetId)?.label ||
          'Unknown';
        message.success(`Peripheral "${assetName}" saved`);

        // Update the peripherals array
        if (peripheral.instrumentPeripheralId < 0) {
          // For new peripherals (negative ID)
          const filteredPeripherals = peripherals.filter(
            p => p.instrumentPeripheralId !== peripheral.instrumentPeripheralId
          );
          onChange([...filteredPeripherals, peripheral]);
        } else {
          // For existing peripherals
          const updatedPeripherals = peripherals.map(p =>
            p.instrumentPeripheralId === peripheral.instrumentPeripheralId ? peripheral : p
          );
          onChange(updatedPeripherals);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting a peripheral
  // For peripherals, we use hard deletion as that's the expected pattern
  const handleDeletePeripheral = (peripheral: InstrumentPeripheralRs) => {
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
      editable: true,
      inputType: 'select',
      options:
        selectors.durableLabAssets?.map(asset => ({
          value: asset.id,
          label: asset.label,
        })) || [],
      rules: [{ required: true, message: 'Please select a lab asset' }],
      render: (assetId: number) => {
        const asset = selectors.durableLabAssets?.find(a => a.id === assetId);
        return asset ? asset.label : `Asset ID: ${assetId}`;
      },
    },
    {
      title: 'Peripheral Type',
      dataIndex: 'peripheralType',
      key: 'peripheralType',
      editable: true,
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
      render: (text: string) => text || '-',
    },
  ];

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
          description="No peripherals have been configured for this instrument."
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
        />
      )}
    </div>
  );
};

export default PeripheralsTab;
