import React from 'react';
import { Button, Alert, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CcSampleTypeRs } from '../../models/types';
import EditableTable, { EditableColumn } from '../tables/EditableTable';
import { stylePresets } from '../../config/theme';

interface SampleTypesTabProps {
  sampleTypes: CcSampleTypeRs[];
  categoryId: number;
  onChange: (sampleTypes: CcSampleTypeRs[]) => void;
  editing?: boolean;
}

const SampleTypesTab: React.FC<SampleTypesTabProps> = ({
  sampleTypes,
  categoryId,
  onChange,
  editing = true,
}) => {
  // Handle adding a new sample type
  const handleAddSampleType = () => {
    if (!editing) return;

    // Create new sample type with default values
    const newSampleType: CcSampleTypeRs = {
      ccSampleTypeId: -Date.now(), // Temporary negative ID
      categoryId: categoryId,
      name: 'New Sample Type',
    };

    // Add to the sampleTypes array
    const updatedSampleTypes = [...sampleTypes, newSampleType];
    onChange(updatedSampleTypes);
  };

  // Handle saving a sample type
  const handleSaveSampleType = (sampleType: CcSampleTypeRs) => {
    // Validate required fields
    if (!sampleType.name) {
      message.error('Please enter a sample type name');
      return Promise.reject('Please enter a sample type name');
    }

    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success(`Sample type "${sampleType.name}" saved`);

        // Update the sampleTypes array
        if (sampleType.ccSampleTypeId < 0) {
          // For new sample types (negative ID)
          const filteredSampleTypes = sampleTypes.filter(
            t => t.ccSampleTypeId !== sampleType.ccSampleTypeId
          );
          onChange([...filteredSampleTypes, sampleType]);
        } else {
          // For existing sample types
          const updatedSampleTypes = sampleTypes.map(t =>
            t.ccSampleTypeId === sampleType.ccSampleTypeId ? sampleType : t
          );
          onChange(updatedSampleTypes);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting a sample type
  const handleDeleteSampleType = (sampleType: CcSampleTypeRs) => {
    // Update by filtering out the deleted sample type
    const updatedSampleTypes = sampleTypes.filter(
      t => t.ccSampleTypeId !== sampleType.ccSampleTypeId
    );

    onChange(updatedSampleTypes);
    message.success(`Sample type "${sampleType.name}" deleted`);
  };

  // Define columns for the sample types table
  const columns: EditableColumn[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      inputType: 'text',
      rules: [
        { required: true, message: 'Please enter sample type name' },
        { max: 150, message: 'Name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Category ID',
      dataIndex: 'categoryId',
      key: 'categoryId',
      editable: false,
      render: (id: number) => id,
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSampleType}>
            Add Sample Type
          </Button>
        </div>
      )}

      {sampleTypes.length === 0 ? (
        <Alert
          message="No Sample Types"
          description="No sample types have been configured for this category."
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={sampleTypes}
          rowKey="ccSampleTypeId"
          pagination={false}
          size="small"
          onSave={handleSaveSampleType}
          onDelete={handleDeleteSampleType}
          editable={editing}
        />
      )}
    </div>
  );
};

export default SampleTypesTab;
