import React, { useMemo } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Alert, Switch, message } from 'antd';
import dayjs from 'dayjs';

import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';

import PeripheralsTab from './PeripheralsTab';
import { InstrumentRs, InstrumentPeripheralRs } from './types';

interface InstrumentsTabProps {
  instruments: InstrumentRs[];
  instrumentTypeId: number;
  selectors: ConfigurationMaintenanceSelectors;
  onChange: (instruments: InstrumentRs[]) => void;
  showInactive?: boolean;
  editing?: boolean;
}

const InstrumentsTab: React.FC<InstrumentsTabProps> = ({
  instruments,
  instrumentTypeId,
  selectors,
  onChange,
  showInactive = false,
  editing = true,
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
      instrumentPeripheralRss: [], // Fixed property name to match interface
    };

    console.log('➕ Adding new instrument and notifying parent');

    // Add to the instruments array and notify parent immediately
    const updatedInstruments = [...instruments, newInstrument];
    onChange(updatedInstruments);
  };

  // Handle saving an instrument - now updates parent immediately
  const handleSaveInstrument = (instrument: InstrumentRs) => {
    console.log('💾 Saving instrument changes and notifying parent');

    // Format dates for consistency
    const updatedInstrument = {
      ...instrument,
      lastPM: instrument.lastPM ? dayjs(instrument.lastPM).toISOString() : null,
      nextPm: instrument.nextPm ? dayjs(instrument.nextPm).toISOString() : null,
      // Ensure boolean values are properly typed
      outOfService:
        typeof instrument.outOfService === 'string'
          ? instrument.outOfService === 'true'
          : !!instrument.outOfService,
      active:
        typeof instrument.active === 'string'
          ? instrument.active === 'true'
          : instrument.active !== false,
    };

    // Update the instruments array and notify parent immediately
    let updatedInstruments;
    if (instrument.instrumentId < 0) {
      // For new instruments (temporary negative ID)
      const filteredInstruments = instruments.filter(
        i => i.instrumentId !== instrument.instrumentId
      );
      updatedInstruments = [...filteredInstruments, updatedInstrument];
    } else {
      // For existing instruments
      updatedInstruments = instruments.map(i =>
        i.instrumentId === instrument.instrumentId ? updatedInstrument : i
      );
    }

    onChange(updatedInstruments);
    message.success(`Instrument ${instrument.name || 'New Instrument'} updated`);

    return Promise.resolve();
  };

  // Handle deleting an instrument - now updates parent immediately
  const handleDeleteInstrument = (instrument: InstrumentRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (instrument.instrumentId >= 0) {
      message.error('Cannot delete existing instrument. Set it to inactive instead.');
      return;
    }

    console.log('🗑️ Deleting instrument and notifying parent');

    // Update by filtering out the deleted instrument and notify parent immediately
    const updatedInstruments = instruments.filter(i => i.instrumentId !== instrument.instrumentId);
    onChange(updatedInstruments);

    message.success(`Instrument ${instrument.name || 'New Instrument'} deleted`);
  };

  // Handle updating peripherals for an instrument - now updates parent immediately
  const handlePeripheralsChange = (instrumentId: number, peripherals: InstrumentPeripheralRs[]) => {
    console.log('🔧 Updating peripherals and notifying parent');

    // Update the specific instrument's peripherals and notify parent immediately
    const updatedInstruments = instruments.map(instrument =>
      instrument.instrumentId === instrumentId
        ? { ...instrument, instrumentPeripheralRss: peripherals } // Fixed property name to match interface
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
      dataIndex: 'instrumentPeripheralRss', // Fixed property name to match interface
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
        editing={editing}
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
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddInstrument}>
            Add Instrument
          </Button>
        </div>
      )}

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
          onDelete={handleDeleteInstrument}
          rowClassName={getRowClassName}
          editable={editing}
          expandable={{
            expandedRowRender,
          }}
          showDeleteButton={canDelete}
        />
      )}
    </div>
  );
};

export default InstrumentsTab;
