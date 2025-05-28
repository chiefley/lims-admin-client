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
  editing = false, // Now controlled by parent edit mode
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
    if (!editing) {
      message.warning('Cannot add instruments - not in edit mode');
      return;
    }

    // Create new instrument with default values
    const newInstrument: InstrumentRs = {
      instrumentId: -Date.now(), // Temporary negative ID
      instrumentTypeId: instrumentTypeId,
      name: '',
      lastPM: null,
      nextPm: null,
      outOfService: false,
      active: true, // New instruments are active by default
      instrumentPeripheralRss: [],
    };

    console.log('➕ Adding new instrument and notifying parent');

    // Add to the instruments array and notify parent immediately
    const updatedInstruments = [...instruments, newInstrument];
    onChange(updatedInstruments);
  };

  // Handle saving an instrument - validation integrated
  const handleSaveInstrument = async (instrument: InstrumentRs): Promise<void> => {
    if (!editing) {
      message.warning('Cannot save changes - not in edit mode');
      return Promise.reject('Not in edit mode');
    }

    // Enhanced validation
    const errors: string[] = [];

    if (!instrument.name?.trim()) {
      errors.push('Instrument name is required');
    }

    if (instrument.name && instrument.name.length > 150) {
      errors.push('Instrument name cannot exceed 150 characters');
    }

    // Validate date logic
    if (instrument.lastPM && instrument.nextPm) {
      const lastPM = dayjs(instrument.lastPM);
      const nextPM = dayjs(instrument.nextPm);

      if (!lastPM.isValid()) {
        errors.push('Last PM date is invalid');
      }

      if (!nextPM.isValid()) {
        errors.push('Next PM date is invalid');
      }

      if (lastPM.isValid() && nextPM.isValid() && nextPM.isBefore(lastPM)) {
        errors.push('Next PM date must be after Last PM date');
      }
    }

    // Check for duplicate names within this instrument type
    const duplicateName = instruments.find(
      i =>
        i.instrumentId !== instrument.instrumentId &&
        i.name?.trim().toLowerCase() === instrument.name?.trim().toLowerCase()
    );
    if (duplicateName) {
      errors.push('Instrument name must be unique within this instrument type');
    }

    if (errors.length > 0) {
      message.error(`Validation failed: ${errors.join(', ')}`);
      return Promise.reject(errors.join(', '));
    }

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
    message.success(`Instrument "${instrument.name || 'New Instrument'}" updated`);

    return Promise.resolve();
  };

  // Handle deleting an instrument
  const handleDeleteInstrument = (instrument: InstrumentRs) => {
    if (!editing) {
      message.warning('Cannot delete instruments - not in edit mode');
      return;
    }

    // Only allow deleting temporary records (negative IDs)
    if (instrument.instrumentId >= 0) {
      message.error('Cannot delete existing instrument. Set it to inactive instead.');
      return;
    }

    console.log('🗑️ Deleting instrument and notifying parent');

    // Update by filtering out the deleted instrument and notify parent immediately
    const updatedInstruments = instruments.filter(i => i.instrumentId !== instrument.instrumentId);
    onChange(updatedInstruments);

    message.success(`Instrument "${instrument.name || 'New Instrument'}" deleted`);
  };

  // Handle updating peripherals for an instrument
  const handlePeripheralsChange = (instrumentId: number, peripherals: InstrumentPeripheralRs[]) => {
    if (!editing) {
      message.warning('Cannot modify peripherals - not in edit mode');
      return;
    }

    console.log('🔧 Updating peripherals and notifying parent');

    // Update the specific instrument's peripherals and notify parent immediately
    const updatedInstruments = instruments.map(instrument =>
      instrument.instrumentId === instrumentId
        ? { ...instrument, instrumentPeripheralRss: peripherals }
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
      editable: editing,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter instrument name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
      render: (text: string) => text || <span className="data-placeholder">Enter name...</span>,
    },
    {
      title: 'Last PM',
      dataIndex: 'lastPM',
      key: 'lastPM',
      editable: editing,
      inputType: 'date',
      inputProps: {
        style: { width: '100%' },
      },
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return <span style={{ color: '#ff4d4f' }}>Invalid date</span>;
        }
      },
    },
    {
      title: 'Next PM',
      dataIndex: 'nextPm',
      key: 'nextPm',
      editable: editing,
      inputType: 'date',
      inputProps: {
        style: { width: '100%' },
      },
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return <span style={{ color: '#ff4d4f' }}>Invalid date</span>;
        }
      },
    },
    {
      title: 'Out of Service',
      dataIndex: 'outOfService',
      key: 'outOfService',
      editable: editing,
      inputType: 'select',
      inputProps: {
        style: { width: '100%' },
      },
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => (
        <Switch checked={value} disabled checkedChildren="Yes" unCheckedChildren="No" />
      ),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      editable: editing,
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
      dataIndex: 'instrumentPeripheralRss',
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
    let className = '';
    if (record.active === false) {
      className += 'inactive-row ';
    }
    // Highlight rows with validation errors
    if (editing && !record.name?.trim()) {
      className += 'validation-error-row';
    }
    return className.trim();
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
              ? editing
                ? 'No instruments have been added for this instrument type. Click "Add Instrument" to create one.'
                : 'No instruments have been added for this instrument type.'
              : editing
              ? "No active instruments found. Use 'Show Inactive' to view inactive instruments or add new ones."
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
          autoSaveOnUnmount={false} // Disable auto-save since we're managing edit mode at page level
        />
      )}

      {editing && filteredInstruments.some(i => !i.name?.trim()) && (
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
          ⚠️ Some instruments are missing required information. Please complete all required fields.
        </div>
      )}
    </div>
  );
};

export default InstrumentsTab;
