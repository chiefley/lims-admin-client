import React from 'react';
import { Button, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  InstrumentRs,
  InstrumentPeripheralRs,
  ConfigurationMaintenanceSelectors,
} from '../../../models/types';
import CardSection from '../../common/CardSection';
import EditableTable, { EditableColumn } from '../../tables/EditableTable';
import { stylePresets } from '../../../config/theme';

interface PeripheralsTabProps {
  instrument: InstrumentRs;
  selectors: ConfigurationMaintenanceSelectors;
  onChange: (peripherals: InstrumentPeripheralRs[]) => void;
}

const PeripheralsTab: React.FC<PeripheralsTabProps> = ({ instrument, selectors, onChange }) => {
  // Make sure instrumentPeripherals is always an array
  const peripherals = instrument.instrumentPeripherals || [];

  // Handle adding a new peripheral
  const handleAddPeripheral = () => {
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

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        // Get the asset name from selectors
        const assetName =
          selectors.durableLabAssets?.find(a => a.id === peripheral.durableLabAssetId)?.label ||
          'Unknown';
        message.success(`Peripheral "${assetName}" saved`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = peripheral.instrumentPeripheralId < 0;
        const finalPeripheral = isNew
          ? {
              ...peripheral,
              instrumentPeripheralId: Math.floor(Math.random() * 1000) + 100,
            }
          : peripheral;

        // Update the peripherals array
        const updatedPeripherals = isNew
          ? [
              ...peripherals.filter(
                p => p.instrumentPeripheralId !== peripheral.instrumentPeripheralId
              ),
              finalPeripheral,
            ]
          : peripherals.map(p =>
              p.instrumentPeripheralId === peripheral.instrumentPeripheralId ? finalPeripheral : p
            );

        onChange(updatedPeripherals);
        resolve();
      }, 500);
    });
  };

  // Handle deleting a peripheral
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
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter a peripheral type' },
        { max: 250, message: 'Type cannot exceed 250 characters' },
      ],
      render: (text: string) => text || '-',
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPeripheral}>
          Add Peripheral
        </Button>
      </div>

      {peripherals.length === 0 ? (
        <Alert
          message="No Peripherals"
          description="No peripherals have been configured for this instrument."
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={peripherals}
          rowKey="instrumentPeripheralId"
          pagination={false}
          size="small"
          onSave={handleSavePeripheral}
          onDelete={handleDeletePeripheral}
          editable={true}
        />
      )}
    </div>
  );
};

export default PeripheralsTab;
