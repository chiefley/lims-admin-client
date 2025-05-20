// src/features/basicTables/FileParserManagement.tsx
import React, { useState, useEffect } from 'react';

import { SearchOutlined, PlusOutlined, FileOutlined, SaveOutlined } from '@ant-design/icons';
import { Typography, Spin, Alert, Button, Input, Space, message, Tabs } from 'antd';

import configurationService from '../../api/endpoints/configurationService';
import { stylePresets } from '../../config/theme';
import CardSection from '../shared/components/CardSection';
import EditableTable, { EditableColumn } from '../shared/components/EditableTable';
import PageHeader from '../shared/components/PageHeader';
import { ConfigurationMaintenanceSelectors } from '../shared/types/common';

import basicTableService from './basicTableService';
import { FileParserRs, FileParserFieldRs } from './types';

const { Text } = Typography;
const { TabPane } = Tabs;

const FileParserManagement: React.FC = () => {
  const [fileParsers, setFileParsers] = useState<FileParserRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredParsers, setFilteredParsers] = useState<FileParserRs[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Load file parsers and selectors
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load both file parsers and selectors in parallel
      const [parsersData, selectorsData] = await Promise.all([
        basicTableService.fetchFileParsers(),
        configurationService.fetchSelectors(),
      ]);

      setFileParsers(parsersData);
      setFilteredParsers(parsersData);
      setSelectors(selectorsData);
      setError(null);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load file parsers');
      message.error('Failed to load file parsers');
    } finally {
      setLoading(false);
    }
  };

  // Filter file parsers based on search text and active tab
  useEffect(() => {
    if (!fileParsers.length) return;

    let filtered = [...fileParsers];

    // Filter by search text if provided
    if (searchText) {
      filtered = filtered.filter(
        parser =>
          parser.version?.toLowerCase().includes(searchText.toLowerCase()) ||
          parser.fileType?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply tab filter if not on "all" tab
    if (activeTabKey !== 'all') {
      filtered = filtered.filter(parser => {
        switch (activeTabKey) {
          case 'csv':
            return parser.fileType?.toLowerCase() === 'csv';
          case 'txt':
            return parser.fileType?.toLowerCase() === 'txt';
          case 'xml':
            return parser.fileType?.toLowerCase() === 'xml';
          default:
            return true;
        }
      });
    }

    setFilteredParsers(filtered);
  }, [searchText, fileParsers, activeTabKey]);

  // Handle saving a file parser
  const handleSaveParser = (record: FileParserRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate required fields
        if (!record.version?.trim()) {
          message.error('Version cannot be empty');
          reject('Version is required');
          return;
        }

        if (!record.fileType?.trim()) {
          message.error('File type cannot be empty');
          reject('File type is required');
          return;
        }

        // Update the file parsers array
        setFileParsers(prevParsers => {
          const updatedParsers = prevParsers.map(parser =>
            parser.fileParserId === record.fileParserId ? record : parser
          );

          // If it's a new record (not found in the array), add it
          if (!prevParsers.some(parser => parser.fileParserId === record.fileParserId)) {
            updatedParsers.push(record);
          }

          return updatedParsers;
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated file parser: ${record.fileType} ${record.version}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle saving a parser field
  const handleSaveParserField = (parserId: number, record: FileParserFieldRs) => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Validate required fields
        if (!record.fieldName?.trim()) {
          message.error('Field name cannot be empty');
          reject('Field name is required');
          return;
        }

        if (!record.bindingProperty?.trim()) {
          message.error('Binding property cannot be empty');
          reject('Binding property is required');
          return;
        }

        // Update the file parsers array
        setFileParsers(prevParsers => {
          return prevParsers.map(parser => {
            if (parser.fileParserId === parserId) {
              const updatedFields = [...parser.fileParserFieldRss];
              const fieldIndex = updatedFields.findIndex(
                field => field.fileParserFieldId === record.fileParserFieldId
              );

              if (fieldIndex >= 0) {
                // Update existing field
                updatedFields[fieldIndex] = record;
              } else {
                // Add new field
                updatedFields.push(record);
              }

              return {
                ...parser,
                fileParserFieldRss: updatedFields,
              };
            }
            return parser;
          });
        });

        // Mark that we have unsaved changes
        setHasChanges(true);

        // Show success message and resolve the promise
        message.success(`Updated parser field: ${record.fieldName}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Handle deleting a file parser
  const handleDeleteParser = (record: FileParserRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.fileParserId >= 0) {
      message.info(
        'Existing file parsers cannot be deleted. They are integral to system operations.'
      );
      return;
    }

    // Remove from file parsers array
    setFileParsers(prevParsers => prevParsers.filter(p => p.fileParserId !== record.fileParserId));

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted file parser: ${record.fileType} ${record.version}`);
  };

  // Handle deleting a parser field
  const handleDeleteParserField = (parserId: number, record: FileParserFieldRs) => {
    // Only allow deleting temporary records (negative IDs)
    if (record.fileParserFieldId >= 0) {
      message.info(
        'Existing parser fields cannot be deleted. They are integral to system operations.'
      );
      return;
    }

    // Remove the field from the parser
    setFileParsers(prevParsers => {
      return prevParsers.map(parser => {
        if (parser.fileParserId === parserId) {
          return {
            ...parser,
            fileParserFieldRss: parser.fileParserFieldRss.filter(
              f => f.fileParserFieldId !== record.fileParserFieldId
            ),
          };
        }
        return parser;
      });
    });

    // Mark that we have changes
    setHasChanges(true);

    message.success(`Deleted parser field: ${record.fieldName}`);
  };

  // Determine if delete button should be shown for a record
  const showDeleteButton = (record: FileParserRs | FileParserFieldRs) => {
    // Only show delete button for temporary records (negative IDs)
    return 'fileParserId' in record ? record.fileParserId < 0 : record.fileParserFieldId < 0;
  };

  // Handle adding a new file parser
  const handleAddParser = () => {
    // Create a new file parser with default values and temporary negative ID
    const newParser: FileParserRs = {
      fileParserId: -Date.now(), // Temporary negative ID
      version: 'New Version',
      fileType: 'CSV', // Default file type
      fieldDelimiter: 'Comma',
      sampleMultiplicity: 'Single',
      instrumentTypeId: null,
      fileParserFieldRss: [],
    };

    // Add to the file parsers array
    setFileParsers(prevParsers => [newParser, ...prevParsers]);

    // Mark that we have changes
    setHasChanges(true);
  };

  // Handle adding a new field to a parser
  const handleAddParserField = (parserId: number) => {
    // Create a new parser field with default values and temporary negative ID
    const newField: FileParserFieldRs = {
      fileParserFieldId: -Date.now(), // Temporary negative ID
      fieldName: 'New Field',
      required: false,
      fileVersionSignal: false,
      bindingProperty: '',
      minimum: null,
      maximum: null,
      defaultValue: null,
      notApplicableSignal: null,
      useDefaultIfNoParse: false,
      regexFormat: null,
      dataFileLevel: 'File',
      sectionOrTableName: 'Main',
      $type: 'SingleValueParserFieldRs',
    };

    // Add the field to the parser
    setFileParsers(prevParsers => {
      return prevParsers.map(parser => {
        if (parser.fileParserId === parserId) {
          return {
            ...parser,
            fileParserFieldRss: [...parser.fileParserFieldRss, newField],
          };
        }
        return parser;
      });
    });

    // Mark that we have changes
    setHasChanges(true);
  };

  // Save all changes to the server
  const handleSaveAllChanges = async () => {
    try {
      setSaving(true);

      // Call the API to save all file parsers
      const savedParsers = await basicTableService.upsertFileParsers(fileParsers);

      // Update local state with saved data from server
      setFileParsers(savedParsers);

      // Reset changes flag
      setHasChanges(false);

      message.success('All file parsers saved successfully');
    } catch (err: any) {
      console.error('Error saving file parsers:', err);
      message.error(`Failed to save file parsers: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Table columns for file parsers
  const parserColumns: EditableColumn[] = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Parser'}</Text>,
      sorter: (a: FileParserRs, b: FileParserRs) => a.version?.localeCompare(b.version || '') || 0,
      rules: [
        { required: true, message: 'Please enter the version' },
        { max: 50, message: 'Version cannot exceed 50 characters' },
      ],
    },
    {
      title: 'File Type',
      dataIndex: 'fileType',
      key: 'fileType',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dataFileTypes?.map(type => ({
          value: type.label,
          label: type.label,
        })) || [],
      inputProps: {
        showSearch: true,
        allowClear: true,
        placeholder: 'Select a file type',
      },
      render: (text: string) => text || '-',
      sorter: (a: FileParserRs, b: FileParserRs) =>
        a.fileType?.localeCompare(b.fileType || '') || 0,
      rules: [{ required: true, message: 'Please select a file type' }],
    },
    {
      title: 'Field Delimiter',
      dataIndex: 'fieldDelimiter',
      key: 'fieldDelimiter',
      editable: true,
      inputType: 'select',
      options:
        selectors?.fieldDelimeterTypes?.map(type => ({
          value: type.label,
          label: type.label,
        })) || [],
      render: (text: string) => text || '-',
      rules: [{ required: true, message: 'Please select a field delimiter' }],
    },
    {
      title: 'Sample Multiplicity',
      dataIndex: 'sampleMultiplicity',
      key: 'sampleMultiplicity',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dataFileSampleMultiplicities?.map(type => ({
          value: type.label,
          label: type.label,
        })) || [],
      render: (text: string) => text || '-',
      rules: [{ required: true, message: 'Please select the sample multiplicity' }],
    },
    {
      title: 'Instrument Type',
      dataIndex: 'instrumentTypeId',
      key: 'instrumentTypeId',
      editable: true,
      inputType: 'select',
      options:
        selectors?.instrumentTypes?.map(type => ({
          value: type.id,
          label: type.label,
        })) || [],
      render: (id: number | null) => {
        if (!id || !selectors) return 'Not Assigned';
        const item = selectors.instrumentTypes.find(type => type.id === id);
        return item ? item.label : `ID: ${id}`;
      },
      rules: [{ required: true, message: 'Please select an instrument type' }],
    },
    {
      title: 'Fields Count',
      dataIndex: 'fileParserFieldRss',
      key: 'fieldsCount',
      render: (fields: FileParserFieldRs[]) => fields?.length || 0,
      width: 120,
      editable: false,
    },
  ];

  // Get field columns for a specific parser
  const getFieldColumns = (parserId: number): EditableColumn[] => [
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      key: 'fieldName',
      editable: true,
      inputType: 'text',
      render: (text: string) => <Text strong>{text || 'New Field'}</Text>,
      sorter: (a: FileParserFieldRs, b: FileParserFieldRs) =>
        a.fieldName?.localeCompare(b.fieldName || '') || 0,
      rules: [
        { required: true, message: 'Please enter the field name' },
        { max: 50, message: 'Field name cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Binding Property',
      dataIndex: 'bindingProperty',
      key: 'bindingProperty',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [
        { required: true, message: 'Please enter the binding property' },
        { max: 50, message: 'Binding property cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Data File Level',
      dataIndex: 'dataFileLevel',
      key: 'dataFileLevel',
      editable: true,
      inputType: 'select',
      options:
        selectors?.dataFileLevels?.map(level => ({
          value: level.label,
          label: level.label,
        })) || [],
      render: (text: string) => text || '-',
      rules: [{ required: true, message: 'Please select a data file level' }],
    },
    {
      title: 'Section/Table',
      dataIndex: 'sectionOrTableName',
      key: 'sectionOrTableName',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || '-',
      rules: [
        { required: true, message: 'Please enter the section or table name' },
        { max: 50, message: 'Section/table name cannot exceed 50 characters' },
      ],
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean | null) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Version Signal',
      dataIndex: 'fileVersionSignal',
      key: 'fileVersionSignal',
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean | null) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Type',
      dataIndex: '$type',
      key: 'type',
      editable: false,
      render: (text: string) => text?.replace('ParserFieldRs', '') || '-',
    },
  ];

  // Create expandable row content for each parser to show its fields
  const expandedRowRender = (record: FileParserRs) => {
    return (
      <div style={{ margin: '0 16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddParserField(record.fileParserId)}
          >
            Add Parser Field
          </Button>
        </div>

        <EditableTable
          columns={getFieldColumns(record.fileParserId)}
          dataSource={record.fileParserFieldRss}
          rowKey="fileParserFieldId"
          onSave={field => handleSaveParserField(record.fileParserId, field as FileParserFieldRs)}
          onDelete={field =>
            handleDeleteParserField(record.fileParserId, field as FileParserFieldRs)
          }
          editable={!saving}
          size="small"
          pagination={false}
          showDeleteButton={showDeleteButton}
        />
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="File Parser Management"
        subtitle="Manage file parsers and their field configurations"
        extra={
          hasChanges && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          )
        }
      />

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button type="primary" onClick={loadData}>
              Retry
            </Button>
          }
        />
      )}

      <CardSection
        icon={<FileOutlined />}
        title="File Parsers"
        extra={
          <Space>
            <Input
              placeholder="Search parsers"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddParser}
              disabled={loading || saving}
            >
              Add Parser
            </Button>
          </Space>
        }
        style={stylePresets.contentCard}
      >
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="All Parsers" key="all" />
          <TabPane tab="CSV Parsers" key="csv" />
          <TabPane tab="Text Parsers" key="txt" />
          <TabPane tab="XML Parsers" key="xml" />
        </Tabs>

        <Spin spinning={loading || saving}>
          <EditableTable
            columns={parserColumns}
            dataSource={filteredParsers}
            rowKey="fileParserId"
            onSave={handleSaveParser}
            onDelete={handleDeleteParser}
            editable={!saving}
            size="small"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
            showDeleteButton={showDeleteButton}
          />
        </Spin>

        {hasChanges && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAllChanges}
              loading={saving}
              disabled={loading}
            >
              Save All Changes
            </Button>
          </div>
        )}
      </CardSection>
    </div>
  );
};

export default FileParserManagement;
