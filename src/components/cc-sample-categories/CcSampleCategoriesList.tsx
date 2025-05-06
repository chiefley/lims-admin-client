import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Tag, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  CcSampleCategoryRs,
  CcSampleTypeRs,
  ConfigurationMaintenanceSelectors,
} from '../../models/types';
import { stylePresets } from '../../config/theme';

const { Text } = Typography;

interface CcSampleCategoriesListProps {
  categories: CcSampleCategoryRs[];
  onSelectCategory: (categoryId: number) => void;
  onDeleteCategory: (categoryId: number) => void;
  selectors: ConfigurationMaintenanceSelectors | null;
}

const CcSampleCategoriesList: React.FC<CcSampleCategoriesListProps> = ({
  categories,
  onSelectCategory,
  onDeleteCategory,
  selectors,
}) => {
  // Define columns for the categories table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CcSampleCategoryRs) => (
        <Text strong>{text || 'New Sample Category'}</Text>
      ),
      sorter: (a: CcSampleCategoryRs, b: CcSampleCategoryRs) => {
        if (!a.name) return -1;
        if (!b.name) return 1;
        return a.name.localeCompare(b.name);
      },
    },
    {
      title: 'Default Production Method',
      dataIndex: 'defaultCcSampleProductionMethodId',
      key: 'defaultCcSampleProductionMethodId',
      render: (methodId: number | null) => {
        if (!selectors || !methodId) return '-';

        // Find the matching production method in the selectors
        // This assumes there's a productionMethods selector array
        // If it doesn't exist, we'll need to use a different approach
        const method = selectors.dbEnumTypes?.find(item => item.id === methodId);
        return method ? method.label : `ID: ${methodId}`;
      },
    },
    {
      title: 'Sample Types',
      key: 'sampleTypes',
      render: (_: any, record: CcSampleCategoryRs) => {
        const count = record.ccSampleTypeRss?.length || 0;
        return (
          <Tag color={count > 0 ? 'green' : 'default'}>
            {count} {count === 1 ? 'Type' : 'Types'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CcSampleCategoryRs) => {
        // Only show delete button for temporary records (negative ID)
        const canDelete = record.ccSampleCategoryId < 0;

        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={e => {
                  e.stopPropagation();
                  onSelectCategory(record.ccSampleCategoryId);
                }}
              />
            </Tooltip>
            {canDelete && (
              <Tooltip title="Delete">
                <Popconfirm
                  title="Are you sure you want to delete this category?"
                  onConfirm={e => {
                    e?.stopPropagation();
                    onDeleteCategory(record.ccSampleCategoryId);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={e => e.stopPropagation()}
                  />
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Expandable row render function - shows sample types
  const expandedRowRender = (record: CcSampleCategoryRs) => {
    // Sample types sub-table
    const sampleTypeColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text || '-'}</Text>,
      },
      {
        title: 'Category ID',
        dataIndex: 'categoryId',
        key: 'categoryId',
        render: (id: number) => id,
      },
    ];

    return (
      <div style={{ margin: '0 16px' }}>
        <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
          Sample Types
        </Text>
        {record.ccSampleTypeRss && record.ccSampleTypeRss.length > 0 ? (
          <Table
            columns={sampleTypeColumns}
            dataSource={record.ccSampleTypeRss}
            rowKey="ccSampleTypeId"
            pagination={false}
            size="small"
          />
        ) : (
          <Text type="secondary">No sample types configured for this category</Text>
        )}
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={categories}
      rowKey="ccSampleCategoryId"
      expandable={{
        expandedRowRender,
        expandRowByClick: true,
      }}
      pagination={{ pageSize: 10 }}
      {...stylePresets.tableStyles}
      onRow={(record: CcSampleCategoryRs) => ({
        onClick: () => onSelectCategory(record.ccSampleCategoryId),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default CcSampleCategoriesList;
