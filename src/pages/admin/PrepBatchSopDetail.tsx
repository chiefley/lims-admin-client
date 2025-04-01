import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Descriptions,
  Button,
  Tabs,
  Tag,
  message,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Space,
  DatePicker,
  Tooltip,
  Popconfirm,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  FileTextOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import {
  fetchPrepBatchSopDetail,
  fetchSelectors,
  savePrepBatchSop,
} from '../../api/endpoints/sopService';
import {
  SopFieldRs,
  DoubleSopFieldRs,
  DateTimeSopFieldRs,
  LabAssetSopFieldRs,
  InstrumentTypeSopFieldRs,
  SopEnumSopFieldRs,
  UserSopFieldRs,
  TextSopFieldRs,
  TableColumnTextSopFieldRs,
} from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import FormItem from '../../components/common/FormItem';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';
import { stylePresets } from '../../config/theme';
import dayjs from 'dayjs';

// Import necessary styles
import '../../styles/editableTable.css';

// Define the types for our component
interface PrepBatchSopDetailProps {}

// Define the component
const PrepBatchSopDetail: React.FC<PrepBatchSopDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sopData, setSopData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectors, setSelectors] = useState<any>({
    manifestSampleTypeItems: [],
    panelGroupItems: [],
    decimalFormatTypes: [],
  });
  const [activeTab, setActiveTab] = useState('basic');

  const { TabPane } = Tabs;

  // Fetch the SOP data
  useEffect(() => {
    const fetchSopData = async () => {
      try {
        setLoading(true);

        // Fetch both the SOP details and selectors in parallel
        const [sopData, selectorsData] = await Promise.all([
          fetchPrepBatchSopDetail(Number(id)),
          fetchSelectors(),
        ]);

        // Update state with fetched data
        setSopData(sopData);
        setSelectors(selectorsData);
        setError(null);

        // Set form values
        form.setFieldsValue({
          ...sopData,
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
        message.error('Failed to load SOP details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSopData();
    }
  }, [id, form]);

  // Handle form submit
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // Prepare the data to save by merging the form values with the existing SOP data
      const dataToSave = {
        ...sopData,
        ...values,
      };

      // Call the service to save the data (this is currently a mock implementation)
      await savePrepBatchSop(dataToSave);

      // Update local state with the saved data
      setSopData(dataToSave);
      message.success('SOP details saved successfully');
      setEditing(false);
    } catch (error) {
      message.error('Validation failed. Please check the form.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    form.setFieldsValue(sopData);
    setEditing(false);
  };

  // Handle adding a new sample type configuration
  const handleAddSampleType = () => {
    // Create new sample type with default values
    const newSample = {
      manifestSamplePrepBatchSopId: -Date.now(),
      batchSopId: parseInt(id || '0'),
      manifestSampleTypeId: null,
      panelGroupId: null,
      panels: '',
      effectiveDate: null,
    };

    // Update local state
    setSopData({
      ...sopData,
      manifestSamplePrepBatchSopRss: [...sopData.manifestSamplePrepBatchSopRss, newSample],
    });

    // Use setTimeout to ensure the state update completes before trying to edit
    setTimeout(() => {
      // Find and click the edit button for the new row
      const newRowEditButton = document.querySelector(
        `.ant-table-row[data-row-key="${newSample.manifestSamplePrepBatchSopId}"] .ant-btn`
      );
      if (newRowEditButton instanceof HTMLElement) {
        newRowEditButton.click();
      }
    }, 100);
  };

  // Handle saving a sample type
  const handleSaveSampleType = (sample: any) => {
    // Simulate API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Sample type configuration saved');

        // If it's a new record (negative ID), assign a proper ID
        const isNew = sample.manifestSamplePrepBatchSopId < 0;
        const updatedSample = isNew
          ? { ...sample, manifestSamplePrepBatchSopId: Math.floor(Math.random() * 1000) + 100 }
          : sample;

        // Update the local state
        setSopData({
          ...sopData,
          manifestSamplePrepBatchSopRss: isNew
            ? [
                ...sopData.manifestSamplePrepBatchSopRss.filter(
                  (s: any) => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
                ),
                updatedSample,
              ]
            : sopData.manifestSamplePrepBatchSopRss.map((s: any) =>
                s.manifestSamplePrepBatchSopId === sample.manifestSamplePrepBatchSopId
                  ? updatedSample
                  : s
              ),
        });

        resolve();
      }, 500);
    });
  };

  // Handle deleting a sample type
  const handleDeleteSampleType = (sample: any) => {
    // Here you would call the delete API
    message.success('Sample type configuration deleted');

    // Update local state
    setSopData({
      ...sopData,
      manifestSamplePrepBatchSopRss: sopData.manifestSamplePrepBatchSopRss.filter(
        (s: any) => s.manifestSamplePrepBatchSopId !== sample.manifestSamplePrepBatchSopId
      ),
    });
  };

  // Columns for the sample types table
  const sampleColumns: EditableColumn[] = [
    {
      title: 'Sample Type',
      dataIndex: 'manifestSampleTypeId',
      key: 'manifestSampleTypeId',
      editable: true,
      inputType: 'select',
      editComponent: Select,
      options: selectors.manifestSampleTypeItems?.map((item: any) => ({
        value: item.id,
        label: item.label,
      })),
      render: (id: number | null) => {
        const item = selectors.manifestSampleTypeItems?.find((item: any) => item.id === id);
        return item ? item.label : 'Not Selected';
      },
      rules: [{ required: true, message: 'Please select a sample type' }],
    },
    {
      title: 'Panel Group',
      dataIndex: 'panelGroupId',
      key: 'panelGroupId',
      editable: true,
      inputType: 'select',
      editComponent: Select,
      options: selectors.panelGroupItems?.map((item: any) => ({
        value: item.id,
        label: item.label,
      })),
      render: (id: number | null) => {
        const item = selectors.panelGroupItems?.find((item: any) => item.id === id);
        return item ? item.label : 'Not Selected';
      },
      rules: [{ required: true, message: 'Please select a panel group' }],
    },
    {
      title: 'Panels',
      dataIndex: 'panels',
      key: 'panels',
      editable: false,
      render: (text: string) => (
        <Typography.Text ellipsis={{ tooltip: text }}>{text || '-'}</Typography.Text>
      ),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      editable: true,
      inputType: 'date',
      render: (date: string | null) => {
        if (!date) return <span className="data-placeholder">Not set</span>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return 'Invalid date';
        }
      },
      rules: [{ required: true, message: 'Please select an effective date' }],
    },
  ];

  // If still loading, show a spinner
  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        >
          <Spin size="large" tip="Loading SOP details..." />
        </div>
      </div>
    );
  }

  // If there was an error, show a message
  if (error) {
    return (
      <div className="page-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/admin/prep-batch-sop')}>
              Back to SOP List
            </Button>
          }
        />
      </div>
    );
  }

  // If no data was found, show a message
  if (!sopData) {
    return (
      <div className="page-container">
        <Alert
          message="SOP Not Found"
          description="The requested SOP could not be found."
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/admin/prep-batch-sop')}>
              Back to SOP List
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/prep-batch-sop')}>
              Back to SOP List
            </Button>
            <span>
              {sopData.name} <Tag color="blue">{sopData.sop}</Tag>{' '}
              <Tag color="green">v{sopData.version}</Tag>
            </span>
          </Space>
        }
        subtitle="Prep Batch SOP Details"
        extra={
          editing ? (
            <Space>
              <Button onClick={handleCancelEdit} icon={<CloseOutlined />} disabled={saving}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleSave} icon={<SaveOutlined />} loading={saving}>
                Save Changes
              </Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setEditing(true)} icon={<EditOutlined />}>
              Edit Details
            </Button>
          )
        }
      />

      <Form form={form} layout="vertical" initialValues={sopData} disabled={!editing}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <SettingOutlined /> Basic Information
              </span>
            }
            key="basic"
          >
            <CardSection title="SOP Details" style={stylePresets.contentCard}>
              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    name="name"
                    label="Name"
                    tooltip="The name of the Prep Batch SOP"
                    rules={[
                      { required: true, message: 'Please enter the SOP name' },
                      { max: 150, message: 'Name cannot exceed 150 characters' },
                    ]}
                  >
                    <Input placeholder="Enter SOP name" disabled={!editing} />
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    name="sop"
                    label="SOP Identifier"
                    tooltip="The unique identifier for this SOP"
                    rules={[
                      { required: true, message: 'Please enter the SOP identifier' },
                      { max: 50, message: 'Identifier cannot exceed 50 characters' },
                    ]}
                  >
                    <Input placeholder="Enter SOP ID" disabled={!editing} />
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem
                    name="version"
                    label="Version"
                    tooltip="The version of this SOP"
                    rules={[
                      { required: true, message: 'Please enter the version' },
                      { max: 10, message: 'Version cannot exceed 10 characters' },
                    ]}
                  >
                    <Input placeholder="e.g., 1.0" disabled={!editing} />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    name="sopGroup"
                    label="SOP Group"
                    tooltip="The group to which this SOP belongs"
                    rules={[
                      { required: true, message: 'Please enter the SOP group' },
                      { max: 50, message: 'Group name cannot exceed 50 characters' },
                    ]}
                  >
                    <Input placeholder="Enter SOP group" disabled={!editing} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    name="decimalFormatType"
                    label="Decimal Format Type"
                    tooltip="The format to use for decimal values"
                    rules={[{ required: true, message: 'Please select a decimal format type' }]}
                  >
                    <Select
                      placeholder="Select decimal format type"
                      disabled={!editing}
                      options={selectors.decimalFormatTypes?.map((item: any) => ({
                        value: item.id,
                        label: item.label,
                      }))}
                    />
                  </FormItem>
                </Col>
              </Row>
            </CardSection>

            <CardSection title="Batch Parameters" style={stylePresets.contentCard}>
              <Row gutter={24}>
                <Col span={8}>
                  <FormItem
                    name="maxSamplesPerBatch"
                    label="Max Samples Per Batch"
                    tooltip="Maximum number of samples allowed in a batch"
                    rules={[
                      { required: true, message: 'Please enter max samples per batch' },
                      { type: 'number', min: 1, message: 'Value must be at least 1' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter max samples"
                      disabled={!editing}
                      min={1}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    name="minWeightG"
                    label="Min Weight (g)"
                    tooltip="Minimum sample weight in grams"
                    rules={[
                      { required: true, message: 'Please enter minimum weight' },
                      { type: 'number', min: 0, message: 'Value must be at least 0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter min weight"
                      disabled={!editing}
                      min={0}
                      step={0.001}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    name="maxWeightG"
                    label="Max Weight (g)"
                    tooltip="Maximum sample weight in grams"
                    rules={[
                      { required: true, message: 'Please enter maximum weight' },
                      { type: 'number', min: 0, message: 'Value must be at least 0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter max weight"
                      disabled={!editing}
                      min={0}
                      step={0.001}
                    />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <FormItem
                    name="defaultDilution"
                    label="Default Dilution"
                    tooltip="Default dilution factor"
                    rules={[
                      { required: true, message: 'Please enter default dilution' },
                      { type: 'number', min: 0, message: 'Value must be at least 0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter dilution"
                      disabled={!editing}
                      min={0}
                      step={0.01}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    name="defaultExtractionVolumeMl"
                    label="Default Extraction Volume (mL)"
                    tooltip="Default extraction volume in milliliters"
                    rules={[
                      { required: true, message: 'Please enter default extraction volume' },
                      { type: 'number', min: 0, message: 'Value must be at least 0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter volume"
                      disabled={!editing}
                      min={0}
                      step={0.1}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    name="defaultInjectionVolumeUl"
                    label="Default Injection Volume (µL)"
                    tooltip="Default injection volume in microliters"
                    rules={[
                      { required: true, message: 'Please enter default injection volume' },
                      { type: 'number', min: 0, message: 'Value must be at least 0' },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter volume"
                      disabled={!editing}
                      min={0}
                      step={0.1}
                    />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <FormItem
                    name="significantDigits"
                    label="Significant Digits"
                    tooltip="Number of significant digits to display"
                    rules={[
                      { required: true, message: 'Please enter significant digits' },
                      {
                        type: 'number',
                        min: 0,
                        max: 10,
                        message: 'Value must be between 0 and 10',
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter digits"
                      disabled={!editing}
                      min={0}
                      max={10}
                    />
                  </FormItem>
                </Col>
              </Row>
            </CardSection>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExperimentOutlined /> Sample Configurations
              </span>
            }
            key="samples"
          >
            <CardSection title="Sample Types and Panel Groups" style={stylePresets.contentCard}>
              <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSampleType}>
                  Add Sample Type
                </Button>
              </div>

              {sopData.manifestSamplePrepBatchSopRss?.length === 0 ? (
                <Alert
                  message="No Sample Types Configured"
                  description="Click 'Add Sample Type' to configure sample types for this SOP."
                  type="info"
                  showIcon
                />
              ) : (
                <EditableTable
                  columns={sampleColumns}
                  dataSource={sopData.manifestSamplePrepBatchSopRss}
                  rowKey="manifestSamplePrepBatchSopId"
                  pagination={false}
                  onSave={handleSaveSampleType}
                  onDelete={handleDeleteSampleType}
                />
              )}
            </CardSection>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined /> SOP Procedures
              </span>
            }
            key="procedures"
          >
            <CardSection title="SOP Procedures" style={stylePresets.contentCard}>
              {sopData.sopProcedures?.length === 0 ? (
                <Alert
                  message="No Procedures Defined"
                  description="This SOP does not have any procedures defined."
                  type="info"
                  showIcon
                />
              ) : (
                <Tabs type="card">
                  {sopData.sopProcedures?.map((procedure: any) => (
                    <TabPane tab={procedure.procedureName} key={procedure.sopProcedureId}>
                      <Card title={`${procedure.section}: ${procedure.procedureName}`} size="small">
                        <Table
                          dataSource={procedure.procedureItems}
                          rowKey="sopProcedurItemId"
                          pagination={false}
                          showHeader={false}
                          size="small"
                          columns={[
                            {
                              title: 'Item',
                              dataIndex: 'itemNumber',
                              key: 'itemNumber',
                              width: 80,
                              render: (text: string) => text || '',
                            },
                            {
                              title: 'Text',
                              dataIndex: 'text',
                              key: 'text',
                              render: (text: string, record: any) => (
                                <div style={{ paddingLeft: record.indentLevel * 20 }}>{text}</div>
                              ),
                            },
                          ]}
                        />
                      </Card>
                    </TabPane>
                  ))}
                </Tabs>
              )}
            </CardSection>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined /> SOP Fields
              </span>
            }
            key="fields"
          >
            <CardSection title="SOP Fields" style={stylePresets.contentCard}>
              {sopData.sopFields?.length === 0 ? (
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
                  columns={[
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
                      render: (text: string) => (
                        <Tag color="blue">{text.replace('SopFieldRs', '')}</Tag>
                      ),
                    },
                    {
                      title: 'Required',
                      dataIndex: 'required',
                      key: 'required',
                      render: (value: boolean) =>
                        value ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag>,
                    },
                  ]}
                  expandable={{
                    expandedRowRender: (record: SopFieldRs) => {
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
                          if (doubleField.precision !== null)
                            properties.push(['Precision', doubleField.precision]);
                          break;
                        case 'DateTimeSopFieldRs':
                          const dateField = record as DateTimeSopFieldRs;
                          properties.push(['Date Only', dateField.datePartOnly ? 'Yes' : 'No']);
                          break;
                        case 'LabAssetSopFieldRs':
                          const labAssetField = record as LabAssetSopFieldRs;
                          properties.push(['Lab Asset Type', labAssetField.labAssetTypeId]);
                          break;
                        case 'TableColumnTextSopFieldRs':
                          const textColField = record as TableColumnTextSopFieldRs;
                          properties.push(['Table Name', textColField.tableName]);
                          properties.push(['Column Width', textColField.columnWidth]);
                          if (textColField.validationRegex)
                            properties.push(['Validation Regex', textColField.validationRegex]);
                          break;
                        // Add other field types as needed
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
                    },
                  }}
                />
              )}
            </CardSection>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};

export default PrepBatchSopDetail;
