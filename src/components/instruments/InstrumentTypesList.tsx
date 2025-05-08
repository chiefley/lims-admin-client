import React from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Button, Space, Tooltip, Popconfirm, Tag, Typography } from 'antd';

import { stylePresets } from '../../config/theme';
import { InstrumentTypeRs, InstrumentRs } from '../../models/types';

const { Text } = Typography;

interface InstrumentTypesListProps {
  instrumentTypes: InstrumentTypeRs[];
  onSelectInstrumentType: (instrumentTypeId: number) => void;
  onDeleteInstrumentType: (instrumentTypeId: number) => void;
  showInactive?: boolean;
}

const InstrumentTypesList: React.FC<InstrumentTypesListProps> = ({
  instrumentTypes,
  onSelectInstrumentType,
  onDeleteInstrumentType,
  showInactive = false,
}) => {
  // Define columns for the instrument types table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InstrumentTypeRs) => (
        <Space>
          <Text strong>{text || 'New Instrument Type'}</Text>
          {record.active === false && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
      sorter: (a: InstrumentTypeRs, b: InstrumentTypeRs) => {
        if (!a.name) return -1;
        if (!b.name) return 1;
        return a.name.localeCompare(b.name);
      },
    },
    {
      title: 'Measurement Type',
      dataIndex: 'measurementType',
      key: 'measurementType',
      render: (text: string) => text || '-',
      sorter: (a: InstrumentTypeRs, b: InstrumentTypeRs) => {
        if (!a.measurementType) return -1;
        if (!b.measurementType) return 1;
        return a.measurementType.localeCompare(b.measurementType);
      },
    },
    {
      title: 'Data Folder',
      dataIndex: 'dataFolder',
      key: 'dataFolder',
      render: (text: string) => text || '-',
    },
    {
      title: 'Parser Type',
      dataIndex: 'instrumentFileParser',
      key: 'instrumentFileParser',
      render: (value: string | null) => {
        if (value === null) return '-';
        // Get the string value directly
        return <Tag color="blue">{value}</Tag>;
      },
    },
    {
      title: 'Instruments',
      key: 'instruments',
      render: (_: any, record: InstrumentTypeRs) => {
        // Count instruments - filter by active status if not showing inactive
        const count =
          record.instrumentRss?.filter(i => showInactive || i.active !== false).length || 0;
        return (
          <Tag color={count > 0 ? 'green' : 'default'}>
            {count} {count === 1 ? 'Instrument' : 'Instruments'}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: InstrumentTypeRs) => {
        return record.active === false ? (
          <Tag color="red">Inactive</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: InstrumentTypeRs) => {
        // Only show delete button for temporary records (negative ID)
        const canDelete = record.instrumentTypeId < 0;
        // Check if there are any active instruments
        const hasActiveInstruments =
          record.instrumentRss && record.instrumentRss.filter(i => i.active !== false).length > 0;

        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onSelectInstrumentType(record.instrumentTypeId)}
              />
            </Tooltip>
            {canDelete && (
              <Tooltip title="Delete">
                <Popconfirm
                  title="Are you sure you want to delete this instrument type?"
                  onConfirm={() => onDeleteInstrumentType(record.instrumentTypeId)}
                  okText="Yes"
                  cancelText="No"
                  disabled={hasActiveInstruments}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={hasActiveInstruments}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Expandable row render function - filter instruments based on showInactive prop
  const expandedRowRender = (record: InstrumentTypeRs) => {
    // Instruments sub-table
    const instrumentColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: InstrumentRs) => (
          <Space>
            <Text strong>{text || '-'}</Text>
            {record.active === false && <Tag color="red">Inactive</Tag>}
          </Space>
        ),
      },
      {
        title: 'Last PM',
        dataIndex: 'lastPM',
        key: 'lastPM',
        render: (date: Date | string | null) => (date ? new Date(date).toLocaleDateString() : '-'),
      },
      {
        title: 'Next PM',
        dataIndex: 'nextPm',
        key: 'nextPm',
        render: (date: Date | string | null) => (date ? new Date(date).toLocaleDateString() : '-'),
      },
      {
        title: 'Status',
        key: 'status',
        render: (_: any, record: InstrumentRs) => (
          <>
            {record.outOfService && <Tag color="red">Out of Service</Tag>}
            {record.active === false ? (
              <Tag color="red">Inactive</Tag>
            ) : (
              <Tag color="green">Active</Tag>
            )}
          </>
        ),
      },
    ];

    // Filter instruments based on showInactive prop
    const filteredInstruments = record.instrumentRss
      ? showInactive
        ? record.instrumentRss
        : record.instrumentRss.filter(i => i.active !== false)
      : [];

    return (
      <div style={{ margin: '0 16px' }}>
        <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
          Instruments{' '}
          {!showInactive &&
            filteredInstruments.length < (record.instrumentRss?.length || 0) &&
            `(${filteredInstruments.length} of ${record.instrumentRss?.length} shown - some are inactive)`}
        </Text>
        {filteredInstruments && filteredInstruments.length > 0 ? (
          <Table
            columns={instrumentColumns}
            dataSource={filteredInstruments}
            rowKey="instrumentId"
            pagination={false}
            size="small"
            rowClassName={(record: InstrumentRs) => (record.active === false ? 'inactive-row' : '')}
          />
        ) : (
          <Text type="secondary">
            {showInactive
              ? 'No instruments configured for this type'
              : "No active instruments found. Use 'Show Inactive' to view inactive instruments."}
          </Text>
        )}
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={instrumentTypes}
      rowKey="instrumentTypeId"
      expandable={{
        expandedRowRender,
        expandRowByClick: true,
      }}
      pagination={{ pageSize: 10 }}
      {...stylePresets.tableStyles}
      onRow={(record: InstrumentTypeRs) => ({
        onClick: () => onSelectInstrumentType(record.instrumentTypeId),
        style: { cursor: 'pointer' },
      })}
      rowClassName={(record: InstrumentTypeRs) => (record.active === false ? 'inactive-row' : '')}
    />
  );
};

export default InstrumentTypesList;
