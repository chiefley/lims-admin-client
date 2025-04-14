import React, { useMemo } from 'react';
import { Button, Alert, DatePicker, Switch, message, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  InstrumentRs,
  InstrumentPeripheralRs,
  ConfigurationMaintenanceSelectors,
} from '../../../models/types';
import CardSection from '../../common/CardSection';
import EditableTable, { EditableColumn } from '../../tables/EditableTable';
import { stylePresets } from '../../../config/theme';
import dayjs from 'dayjs';
import PeripheralsTab from './PeripheralsTab';

const { TabPane } = Tabs;

interface InstrumentsTabProps {
  instruments: InstrumentRs[];
  instrumentTypeId: number;
  selectors: ConfigurationMaintenanceSelectors;
  onChange: (instruments: InstrumentRs[]) => void;
  showInactive?: boolean;
}

const InstrumentsTab: React.FC<InstrumentsTabProps> = ({
  instruments,
  instrumentTypeId,
  selectors,
  onChange,
  showInactive = false,
}) => {
  // Filter instruments based on showInactive prop
  const filteredInstruments = useMemo(() => {
    if (showInactive) {
      return instruments;
    }
    return instruments.filter(instrument => instrument.active !== false);
  }, [instruments, showInactive]);

  // Handle adding a new instrument
  const handleAddInstrument = () => {
    // Create new instrument with default values
    const newInstrument: InstrumentRs = {
      instrumentId: -Date.now(), // Temporary negative ID
      instrumentTypeId: instrumentTypeId,
      name: '',
      lastPM: null,
      nextPm: null,
      outOfService: false,
      active: true, // New instruments are active by default
      instrumentPeripherals: [],
    };

    // Add to the instruments array
    const updatedInstruments = [...instruments, newInstrument];
    onChange(updatedInstruments);
  };

  // Handle saving an instrument
  const handleSaveInstrument = (instrument: InstrumentRs) => {
    // Format dates for API submission
    const updatedInstrument = {
      ...instrument,
      lastPM: instrument.lastPM ? dayjs(instrument.lastPM).toISOString() : null,
      nextPm: instrument.nextPm ? dayjs(instrument.nextPm).toISOString() : null,
      // Ensure outOfService is a boolean (might come as a string from the form)
      outOfService:
        typeof instrument.outOfService === 'string'
          ? instrument.outOfService === 'true'
          : !!instrument.outOfService,
      // Ensure active is a boolean
      active:
        typeof instrument.active === 'string'
          ? instrument.active === 'true'
          : instrument.active !== false,
    };

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success(`Instrument ${instrument.name || 'New Instrument'} saved`);

        // If it's a new record (negative ID), assign a proper ID
        const isNew = instrument.instrumentId < 0;
        const finalInstrument = isNew
          ? { ...updatedInstrument, instrumentId: Math.floor(Math.random() * 1000) + 100 }
          : updatedInstrument;

        // Update the instruments array
        const updatedInstruments = isNew
          ? [
              ...instruments.filter(i => i.instrumentId !== instrument.instrumentId),
              finalInstrument,
            ]
          : instruments.map(i =>
              i.instrumentId === instrument.instrumentId ? finalInstrument : i
            );

        onChange(updatedInstruments);
        resolve();
      }, 500);
    });
  };

  // Handle deleting an instrument
  const handleDeleteInstrument = (instrument: InstrumentRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (instrument.instrumentId >= 0) {
      message.error('Cannot delete existing instrument. Set it to inactive instead.');
      return;
    }

    // Update by filtering out the deleted instrument
    const updatedInstruments = instruments.filter(i => i.instrumentId !== instrument.instrumentId);

    onChange(updatedInstruments);
    message.success(`Instrument ${instrument.name || 'New Instrument'} deleted`);
  };

  // Handle updating peripherals for an instrument
  const handlePeripheralsChange = (instrumentId: number, peripherals: InstrumentPeripheralRs[]) => {
    // Update the specific instrument's peripherals
    const updatedInstruments = instruments.map(instrument =>
      instrument.instrumentId === instrumentId
        ? { ...instrument, instrumentPeripherals: peripherals }
        : instrument
    );

    onChange(updatedInstruments);
  };

  // Define columns for the instruments table
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter instrument name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Last PM',
      dataIndex: 'lastPM',
      key: 'lastPM',
      editable: true,
      inputType: 'date',
      inputProps: {
        style: { width: '100%' },
      },
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return 'Invalid date';
        }
      },
    },
    {
      title: 'Next PM',
      dataIndex: 'nextPm',
      key: 'nextPm',
      editable: true,
      inputType: 'date',
      inputProps: {
        style: { width: '100%' },
      },
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return 'Invalid date';
        }
      },
    },
    {
      title: 'Out of Service',
      dataIndex: 'outOfService',
      key: 'outOfService',
      editable: true,
      inputType: 'select',
      inputProps: {
        style: { width: '100%' },
      },
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => <Switch checked={value} disabled />,
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
      render: (value: boolean) => (
        <Switch
          checked={value !== false}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          disabled
        />
      ),
    },
    {
      title: 'Peripherals',
      dataIndex: 'instrumentPeripherals',
      key: 'peripheralsCount',
      editable: false,
      render: (peripherals: InstrumentPeripheralRs[], record: InstrumentRs) => {
        const count = peripherals?.length || 0;
        return `${count} ${count === 1 ? 'peripheral' : 'peripherals'}`;
      },
    },
  ];

  // Configure expanded row rendering to show peripherals
  const expandedRowRender = (record: InstrumentRs) => {
    return (
      <PeripheralsTab
        instrument={record}
        selectors={selectors}
        onChange={peripherals => handlePeripheralsChange(record.instrumentId, peripherals)}
        showInactive={showInactive}
      />
    );
  };

  // Custom row class to visually indicate inactive instruments
  const getRowClassName = (record: InstrumentRs) => {
    return record.active === false ? 'inactive-row' : '';
  };

  // Only allow deletion of temporary (negative ID) instruments
  const canDelete = (record: InstrumentRs) => record.instrumentId < 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInstrument}>
          Add Instrument
        </Button>
      </div>

      {filteredInstruments.length === 0 ? (
        <Alert
          message="No Instruments"
          description={
            showInactive
              ? 'No instruments have been added for this instrument type.'
              : "No active instruments found. Use 'Show Inactive' to view inactive instruments."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={filteredInstruments}
          rowKey="instrumentId"
          pagination={false}
          size="small"
          onSave={handleSaveInstrument}
          onDelete={canDelete}
          rowClassName={getRowClassName}
          editable={true}
          expandable={{
            expandedRowRender,
          }}
        />
      )}
    </div>
  );
};

export default InstrumentsTab;
