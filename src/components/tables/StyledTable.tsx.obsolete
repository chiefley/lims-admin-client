import React from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import { stylePresets } from '../../config/theme';

/**
 * StyledTable component that applies consistent styling to all tables
 * This extends the standard Ant Design Table with our application-specific styling
 */
function StyledTable<RecordType extends object = any>(
  props: TableProps<RecordType> & { striped?: boolean }
) {
  const { striped = true, ...restProps } = props;

  // Apply our default table styles
  const defaultProps: TableProps<RecordType> = {
    bordered: true,
    size: 'middle',
    scroll: { x: 'max-content' },
    className: striped ? 'ant-table-striped' : '',
  };

  return <Table<RecordType> {...defaultProps} {...restProps} />;
}

export default StyledTable;
