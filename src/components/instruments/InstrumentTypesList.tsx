import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { InstrumentTypeRs, InstrumentFileParserType } from '../../models/types';
import { stylePresets } from '../../config/theme';

const { Text } = Typography;

interface InstrumentTypesListProps {
  instrumentTypes: InstrumentTypeRs[];
  onSelectInstrumentType: (instrumentTypeId: number) => void;
  onDeleteInstrumentType: (instrumentTypeId: number) => void;
}

const InstrumentTypesList: React.FC<InstrumentTypesListProps> = ({
  instrumentTypes,
  onSelectInstrumentType,
  onDeleteInstrumentType,
}) => {
  // Define columns for the instrument types table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: InstrumentTypeRs) => (
        <Text strong>{text || 'New Instrument Type'}</Text>
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
      render: (value: InstrumentFileParserType | null) => {
        if (value === null) return '-';
        // Get the enum name as a string
        const parserName = InstrumentFileParserType[value];
        return <Tag color="blue">{parserName}</Tag>;
      },
    },
    {
      title: 'Instruments',
      key: 'instruments',
      render: (text: string, record: InstrumentTypeRs) => {
        const count = record.instrumentRss?.length || 0;
        return (
          <Tag color={count > 0 ? 'green' : 'default'}>
            {count} {count === 1 ? 'Instrument' : 'Instruments'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: InstrumentTypeRs) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onSelectInstrumentType(record.instrumentTypeId)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this instrument type?"
              onConfirm={() => onDeleteInstrumentType(record.instrumentTypeId)}
              okText="Yes"
              cancelText="No"
              disabled={record.instrumentRss && record.instrumentRss.length > 0}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.instrumentRss && record.instrumentRss.length > 0}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expandable row render function
  const expandedRowRender = (record: InstrumentTypeRs) => {
    // Instruments sub-table
    const instrumentColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text || '-'}</Text>,
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
        dataIndex: 'outOfService',
        key: 'outOfService',
        render: (outOfService: boolean) => (
          <Tag color={outOfService ? 'red' : 'green'}>
            {outOfService ? 'Out of Service' : 'In Service'}
          </Tag>
        ),
      },
    ];

    return (
      <div style={{ margin: '0 16px' }}>
        <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
          Instruments
        </Text>
        {record.instrumentRss && record.instrumentRss.length > 0 ? (
          <Table
            columns={instrumentColumns}
            dataSource={record.instrumentRss}
            rowKey="instrumentId"
            pagination={false}
            size="small"
          />
        ) : (
          <Text type="secondary">No instruments configured for this type</Text>
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
      onRow={record => ({
        onClick: () => onSelectInstrumentType(record.instrumentTypeId),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default InstrumentTypesList;
