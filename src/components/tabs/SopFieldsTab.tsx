import React from 'react';
import { Typography, Table, Alert, Tag, Descriptions } from 'antd';
import {
  SopFieldRs,
  DoubleSopFieldRs,
  DateTimeSopFieldRs,
  LabAssetSopFieldRs,
  TableColumnTextSopFieldRs,
  InstrumentTypeSopFieldRs,
  SopEnumSopFieldRs,
  UserSopFieldRs,
  TextSopFieldRs,
  TableColumnIntSopFieldRs,
  TableColumnDoubleSopFieldRs,
  TableColumnDateTimeFieldRs,
  TableColumnSopEnumFieldRs,
} from '../../models/types';
import CardSection from '../common/CardSection';
import { stylePresets } from '../../config/theme';

// Create a generic SopData type that includes only the properties we need
interface SopData {
  sopFields: SopFieldRs[];
}

interface SopFieldsTabProps {
  sopData: SopData;
  editing: boolean;
  onFieldsChange?: (fields: SopFieldRs[]) => void;
}

/**
 * Component for displaying SOP field definitions
 */
const SopFieldsTab: React.FC<SopFieldsTabProps> = ({ sopData, editing, onFieldsChange }) => {
  // Define the columns for the SOP fields table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: 'Type',
      dataIndex: '$type',
      key: 'type',
      render: (text: string) => <Tag color="blue">{text.replace('SopFieldRs', '')}</Tag>,
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (value: boolean) => (value ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag>),
    },
  ];

  /**
   * Helper function to render field-specific properties in the expandable row
   */
  const renderFieldProperties = (record: SopFieldRs) => {
    // Create a list of field properties based on the field type
    const properties: [string, any][] = [];

    // Add common properties
    if (record.batchPropertyName) {
      properties.push(['Batch Property', record.batchPropertyName]);
    }

    // Add type-specific properties
    switch (record.$type) {
      case 'DoubleSopFieldRs':
        const doubleField = record as DoubleSopFieldRs;
        if (doubleField.minDoubleValue !== null)
          properties.push(['Min Value', doubleField.minDoubleValue]);
        if (doubleField.maxDoubleValue !== null)
          properties.push(['Max Value', doubleField.maxDoubleValue]);
        if (doubleField.precision !== null) properties.push(['Precision', doubleField.precision]);
        break;
      case 'DateTimeSopFieldRs':
        const dateField = record as DateTimeSopFieldRs;
        properties.push(['Date Only', dateField.datePartOnly ? 'Yes' : 'No']);
        break;
      case 'LabAssetSopFieldRs':
        const labAssetField = record as LabAssetSopFieldRs;
        properties.push(['Lab Asset Type', labAssetField.labAssetTypeId]);
        break;
      case 'InstrumentTypeSopFieldRs':
        const instrumentField = record as InstrumentTypeSopFieldRs;
        properties.push(['Instrument Type', instrumentField.instrumentTypeId]);
        break;
      case 'SopEnumSopFieldRs':
        const enumField = record as SopEnumSopFieldRs;
        properties.push(['SOP Enum Type', enumField.sopEnumTypeId]);
        break;
      case 'UserSopFieldRs':
        const userField = record as UserSopFieldRs;
        properties.push(['Application Role', userField.applicationRoleId]);
        break;
      case 'TextSopFieldRs':
        // No additional properties
        break;
      case 'TableColumnTextSopFieldRs':
        const textColField = record as TableColumnTextSopFieldRs;
        properties.push(['Table Name', textColField.tableName]);
        properties.push(['Column Width', textColField.columnWidth]);
        if (textColField.validationRegex)
          properties.push(['Validation Regex', textColField.validationRegex]);
        if (textColField.minLength !== null)
          properties.push(['Min Length', textColField.minLength]);
        if (textColField.maxLength !== null)
          properties.push(['Max Length', textColField.maxLength]);
        break;
      case 'TableColumnIntSopFieldRs':
        const intColField = record as TableColumnIntSopFieldRs;
        properties.push(['Table Name', intColField.tableName]);
        properties.push(['Column Width', intColField.columnWidth]);
        if (intColField.minIntValue !== null)
          properties.push(['Min Value', intColField.minIntValue]);
        if (intColField.maxIntValue !== null)
          properties.push(['Max Value', intColField.maxIntValue]);
        break;
      case 'TableColumnDoubleSopFieldRs':
        const doubleColField = record as TableColumnDoubleSopFieldRs;
        properties.push(['Table Name', doubleColField.tableName]);
        properties.push(['Column Width', doubleColField.columnWidth]);
        if (doubleColField.minDoubleValue !== null)
          properties.push(['Min Value', doubleColField.minDoubleValue]);
        if (doubleColField.maxDoubleValue !== null)
          properties.push(['Max Value', doubleColField.maxDoubleValue]);
        properties.push(['Precision', doubleColField.precision]);
        break;
      case 'TableColumnDateTimeFieldRs':
        const dateColField = record as TableColumnDateTimeFieldRs;
        properties.push(['Table Name', dateColField.tableName]);
        properties.push(['Column Width', dateColField.columnWidth]);
        properties.push(['Date Only', dateColField.datePartOnly ? 'Yes' : 'No']);
        break;
      case 'TableColumnSopEnumFieldRs':
        const enumColField = record as TableColumnSopEnumFieldRs;
        properties.push(['Table Name', enumColField.tableName]);
        properties.push(['Column Width', enumColField.columnWidth]);
        break;
    }

    return (
      <Descriptions size="small" bordered column={2}>
        {properties.map(([label, value]) => (
          <Descriptions.Item key={label} label={label}>
            {value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  return (
    <CardSection title="SOP Fields" style={stylePresets.contentCard}>
      {!sopData.sopFields || sopData.sopFields.length === 0 ? (
        <Alert
          message="No Fields Defined"
          description="This SOP does not have any custom fields defined."
          type="info"
          showIcon
        />
      ) : (
        <Table
          dataSource={sopData.sopFields}
          rowKey="sopFieldId"
          size="small"
          columns={columns}
          expandable={{
            expandedRowRender: renderFieldProperties,
          }}
        />
      )}
    </CardSection>
  );
};

export default SopFieldsTab;
