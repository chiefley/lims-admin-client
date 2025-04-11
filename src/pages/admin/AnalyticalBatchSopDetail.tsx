import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Button,
  Tabs,
  Tag,
  message,
  Form,
  Alert,
  Space,
  Input,
  Select,
  InputNumber,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  EditOutlined,
  FileTextOutlined,
  CloseOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  ExceptionOutlined,
  DatabaseOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  fetchAnalyticalBatchSopRs,
  fetchSelectors,
} from '../../api/endpoints/configurationService';
import {
  AnalyticalBatchSopRs,
  ConfigurationMaintenanceSelectors,
  AnalyticalBatchSopAnalyteRs,
  AnalyticalBatchSopControlSampleRs,
  SopAnalysisReviewComponentRs,
  PrepBatchSopAnalyticalBatchSopRs,
  SopFieldRs,
  SopProcedureRs,
} from '../../models/types';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import EditableTable, { EditableColumn } from '../../components/tables/EditableTable';
import { stylePresets } from '../../config/theme';
import { SopFieldsTab, SopProceduresTab } from '../../components/tabs';
import FormItem from '../../components/common/FormItem';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

// Define the component
const AnalyticalBatchSopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sopData, setSopData] = useState<AnalyticalBatchSopRs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch the SOP data
  useEffect(() => {
    const fetchSopData = async () => {
      try {
        setLoading(true);

        // Fetch both the SOP details and selectors in parallel
        const [sopData, selectorsData] = await Promise.all([
          fetchAnalyticalBatchSopRs(Number(id)),
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

      // Create the final data object by merging form values with the existing SOP data
      const dataToSave = {
        ...sopData,
        ...values,
      };

      // Call the service to save the data
      // Implement saveThroughAPI function
      // await saveThroughAPI(dataToSave);

      // Just update local state for now
      setSopData(dataToSave);
      message.success('SOP details saved successfully');
      setEditing(false);
    } catch (error) {
      console.error('Save error:', error);
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

  // Handle analytes changes
  const handleAnalytesChange = (analytes: AnalyticalBatchSopAnalyteRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      analyticalBatchSopAnalytesRss: analytes,
    });
  };

  // Handle control samples changes
  const handleControlSamplesChange = (controlSamples: AnalyticalBatchSopControlSampleRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      analyticalBatchSopControlSampleRss: controlSamples,
    });
  };

  // Handle review components changes
  const handleReviewComponentsChange = (components: SopAnalysisReviewComponentRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      sopAnalysisReviewComponentRss: components,
    });
  };

  // Handle prep batch SOP links changes
  const handlePrepBatchSopsChange = (prepBatchSops: PrepBatchSopAnalyticalBatchSopRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      prepBatchSopAnalyticalBatchSopRss: prepBatchSops,
    });
  };

  // Handle procedures changes
  const handleProceduresChange = (procedures: SopProcedureRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      sopProcedures: procedures,
    });
  };

  // Handle fields changes (if editing is implemented in the future)
  const handleFieldsChange = (fields: SopFieldRs[]) => {
    if (!sopData) return;

    setSopData({
      ...sopData,
      sopFields: fields,
    });
  };

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
            flexDirection: 'column',
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading SOP details...</div>
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
            <Button type="primary" onClick={() => navigate('/admin/analytical-batch-sop')}>
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
          description="The requested Analytical SOP could not be found."
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/admin/analytical-batch-sop')}>
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
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/analytical-batch-sop')}
            >
              Back to SOP List
            </Button>
            <span>
              {sopData.name} <Tag color="blue">{sopData.sop}</Tag>{' '}
              <Tag color="green">v{sopData.version}</Tag>
            </span>
          </Space>
        }
        subtitle="Analytical Batch SOP Details"
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
            <BasicInfoTab sopData={sopData} editing={editing} selectors={selectors} form={form} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExperimentOutlined /> Analytes
              </span>
            }
            key="analytes"
          >
            <AnalytesTab
              sopData={sopData}
              selectors={selectors}
              editing={editing}
              onAnalytesChange={handleAnalytesChange}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <AppstoreOutlined /> Control Samples
              </span>
            }
            key="controlSamples"
          >
            <ControlSamplesTab
              sopData={sopData}
              selectors={selectors}
              editing={editing}
              onControlSamplesChange={handleControlSamplesChange}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExceptionOutlined /> Review Components
              </span>
            }
            key="reviewComponents"
          >
            <ReviewComponentsTab
              sopData={sopData}
              editing={editing}
              onReviewComponentsChange={handleReviewComponentsChange}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ApartmentOutlined /> Prep Batch SOPs
              </span>
            }
            key="prepBatchSops"
          >
            <PrepBatchSopsTab
              sopData={sopData}
              selectors={selectors}
              editing={editing}
              onPrepBatchSopsChange={handlePrepBatchSopsChange}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined /> SOP Procedures
              </span>
            }
            key="procedures"
          >
            <SopProceduresTab
              sopData={sopData}
              editing={editing}
              onProceduresChange={handleProceduresChange}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <DatabaseOutlined /> SOP Fields
              </span>
            }
            key="fields"
          >
            <SopFieldsTab sopData={sopData} editing={editing} onFieldsChange={handleFieldsChange} />
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};

// Basic Information Tab Component
interface TabProps {
  sopData: AnalyticalBatchSopRs;
  selectors: SopMaintenanceSelectors | null;
  editing: boolean;
  form: any;
}

const BasicInfoTab: React.FC<TabProps> = ({ sopData, editing, selectors, form }) => {
  if (!selectors) return <Spin />;

  return (
    <>
      <CardSection title="SOP Details" style={stylePresets.contentCard}>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              name="name"
              label="Name"
              tooltip="The name of the Analytical Batch SOP"
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
          <Col span={6}>
            <FormItem
              name="instrumentTypeId"
              label="Instrument Type"
              tooltip="The type of instrument used for this analysis"
            >
              <Select placeholder="Select instrument type" disabled={!editing} allowClear>
                {selectors.instrumentTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={6}>
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

      <CardSection title="Analysis Parameters" style={stylePresets.contentCard}>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="reportPercentType"
              label="Report Percent Type"
              tooltip="The type of percentage to report"
              rules={[{ required: true, message: 'Please select a report percent type' }]}
            >
              <Select placeholder="Select report percent type" disabled={!editing}>
                {selectors.reportPercentTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="concentrationScaleFactor"
              label="Concentration Scale Factor"
              tooltip="Factor to scale concentration results by"
              rules={[
                { required: true, message: 'Please enter concentration scale factor' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter factor"
                disabled={!editing}
                min={0}
                step={0.001}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="percentScaleFactor"
              label="Percent Scale Factor"
              tooltip="Factor to scale percentage results by"
              rules={[
                { required: true, message: 'Please enter percent scale factor' },
                { type: 'number', min: 0, message: 'Value must be at least 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter factor"
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
              name="measuredUnits"
              label="Measured Units"
              tooltip="Units in which measurements are taken"
              rules={[
                { required: true, message: 'Please enter measured units' },
                { max: 50, message: 'Units cannot exceed 50 characters' },
              ]}
            >
              <Input placeholder="e.g., mg/L" disabled={!editing} />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="reportingUnits"
              label="Reporting Units"
              tooltip="Units used in reports"
              rules={[
                { required: true, message: 'Please enter reporting units' },
                { max: 50, message: 'Units cannot exceed 50 characters' },
              ]}
            >
              <Input placeholder="e.g., mg/kg" disabled={!editing} />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="analysisMethodType"
              label="Analysis Method Type"
              tooltip="The type of analysis method"
              rules={[{ required: true, message: 'Please select an analysis method type' }]}
            >
              <Select placeholder="Select analysis method type" disabled={!editing}>
                {selectors.analysisMethodTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="aggregateRollupMethodType"
              label="Aggregate Rollup Method Type"
              tooltip="The method used for aggregating results"
              rules={[{ required: true, message: 'Please select an aggregate rollup method type' }]}
            >
              <Select placeholder="Select aggregate rollup method type" disabled={!editing}>
                {selectors.aggregateRollupMethodTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="lLoqComparisonType"
              label="LLoQ Comparison Type"
              tooltip="Comparison type for Lower Limit of Quantification"
              rules={[{ required: true, message: 'Please select a LLoQ comparison type' }]}
            >
              <Select placeholder="Select LLoQ comparison type" disabled={!editing}>
                {selectors.comparisonTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              name="uLoqComparisonType"
              label="ULoQ Comparison Type"
              tooltip="Comparison type for Upper Limit of Quantification"
              rules={[{ required: true, message: 'Please select a ULoQ comparison type' }]}
            >
              <Select placeholder="Select ULoQ comparison type" disabled={!editing}>
                {selectors.comparisonTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="actionLimitComparisonType"
              label="Action Limit Comparison Type"
              tooltip="Comparison type for action limits"
              rules={[{ required: true, message: 'Please select an action limit comparison type' }]}
            >
              <Select placeholder="Select action limit comparison type" disabled={!editing}>
                {selectors.comparisonTypes.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <FormItem
              name="suppressLoqsForComputedAnalytes"
              label="Suppress LoQs for Computed Analytes"
              tooltip="Suppress Limits of Quantification for computed analytes"
              valuePropName="checked"
            >
              <Switch disabled={!editing} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="requiresMoistureCorrection"
              label="Requires Moisture Correction"
              tooltip="Sample requires moisture content correction"
              valuePropName="checked"
            >
              <Switch disabled={!editing} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="requiresServingAndContainerResults"
              label="Requires Serving/Container Results"
              tooltip="Results must include serving and container information"
              valuePropName="checked"
            >
              <Switch disabled={!editing} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              name="rollupRsd"
              label="Rollup RSD"
              tooltip="Roll up Relative Standard Deviation"
              valuePropName="checked"
            >
              <Switch disabled={!editing} />
            </FormItem>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              name="rsaUseNominalValues"
              label="RSA Use Nominal Values"
              tooltip="Use nominal values for Relative Standard Addition"
              valuePropName="checked"
            >
              <Switch disabled={!editing} />
            </FormItem>
          </Col>
          {sopData.rsaUseNominalValues && (
            <>
              <Col span={8}>
                <FormItem
                  name="rsaNominalSampleWeightG"
                  label="RSA Nominal Sample Weight (g)"
                  tooltip="Nominal sample weight in grams for Relative Standard Addition"
                  rules={[
                    { required: true, message: 'Please enter nominal sample weight' },
                    { type: 'number', min: 0, message: 'Value must be at least 0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter weight"
                    disabled={!editing}
                    min={0}
                    step={0.001}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  name="rsaNominalExtractionVolumeL"
                  label="RSA Nominal Extraction Volume (L)"
                  tooltip="Nominal extraction volume in liters for Relative Standard Addition"
                  rules={[
                    { required: true, message: 'Please enter nominal extraction volume' },
                    { type: 'number', min: 0, message: 'Value must be at least 0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter volume"
                    disabled={!editing}
                    min={0}
                    step={0.001}
                  />
                </FormItem>
              </Col>
            </>
          )}
        </Row>
      </CardSection>
    </>
  );
};

// Analytes Tab Component
interface AnalytesTabProps {
  sopData: AnalyticalBatchSopRs;
  selectors: SopMaintenanceSelectors | null;
  editing: boolean;
  onAnalytesChange: (analytes: AnalyticalBatchSopAnalyteRs[]) => void;
}

const AnalytesTab: React.FC<AnalytesTabProps> = ({
  sopData,
  selectors,
  editing,
  onAnalytesChange,
}) => {
  if (!selectors) return <Spin />;

  // Handle adding a new analyte
  const handleAddAnalyte = () => {
    const newAnalyte: AnalyticalBatchSopAnalyteRs = {
      analyticalBatchSopAnalyteId: -Date.now(),
      analyticalBatchSopId: sopData.batchSopId,
      analyteId: null,
      computed: false,
      computeAggregateAnalyte: false,
      isInternalStandard: false,
      warningStd: null,
      confidenceStd: null,
      testStd: null,
      analystDisplayOrder: null,
      computedAnalyteConstituentRss: [],
    };

    onAnalytesChange([...sopData.analyticalBatchSopAnalytesRss, newAnalyte]);
  };

  // Handle saving an analyte
  const handleSaveAnalyte = (analyte: AnalyticalBatchSopAnalyteRs) => {
    // Simulate an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Analyte saved successfully');

        // Update the analytes by replacing the edited one
        const updatedAnalytes = sopData.analyticalBatchSopAnalytesRss.map(a =>
          a.analyticalBatchSopAnalyteId === analyte.analyticalBatchSopAnalyteId ? analyte : a
        );

        // If it's a new record (negative ID), replace it with a "saved" version
        if (analyte.analyticalBatchSopAnalyteId < 0) {
          const savedAnalyte = {
            ...analyte,
            analyticalBatchSopAnalyteId: Math.floor(Math.random() * 1000) + 100,
          };

          const filteredAnalytes = updatedAnalytes.filter(
            a => a.analyticalBatchSopAnalyteId !== analyte.analyticalBatchSopAnalyteId
          );

          onAnalytesChange([...filteredAnalytes, savedAnalyte]);
        } else {
          onAnalytesChange(updatedAnalytes);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting an analyte
  const handleDeleteAnalyte = (analyte: AnalyticalBatchSopAnalyteRs) => {
    const updatedAnalytes = sopData.analyticalBatchSopAnalytesRss.filter(
      a => a.analyticalBatchSopAnalyteId !== analyte.analyticalBatchSopAnalyteId
    );

    onAnalytesChange(updatedAnalytes);
    message.success('Analyte deleted successfully');
  };

  // Define columns for the analytes table
  const columns: EditableColumn[] = [
    {
      title: 'Analyte',
      dataIndex: 'analyteId',
      key: 'analyteId',
      editable: true,
      inputType: 'select',
      options: selectors.compounds.map(compound => ({
        value: compound.id,
        label: compound.label,
      })),
      render: (id: number | null) => {
        if (!id) return <Text type="secondary">Not selected</Text>;
        const compound = selectors.compounds.find(c => c.id === id);
        return compound ? compound.label : `ID: ${id}`;
      },
      rules: [{ required: true, message: 'Please select an analyte' }],
    },
    {
      title: 'Display Order',
      dataIndex: 'analystDisplayOrder',
      key: 'analystDisplayOrder',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Computed',
      dataIndex: 'computed',
      key: 'computed',
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Internal Standard',
      dataIndex: 'isInternalStandard',
      key: 'isInternalStandard',
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'Warning Std',
      dataIndex: 'warningStd',
      key: 'warningStd',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Confidence Std',
      dataIndex: 'confidenceStd',
      key: 'confidenceStd',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Test Std',
      dataIndex: 'testStd',
      key: 'testStd',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Constituents',
      dataIndex: 'computedAnalyteConstituentRss',
      key: 'constituents',
      editable: false,
      render: (constituents: any[]) => constituents?.length ?? 0,
    },
  ];

  // Component for expanded row to show constituents
  const expandedRowRender = (record: AnalyticalBatchSopAnalyteRs) => {
    if (!record.computed || !record.computedAnalyteConstituentRss?.length) {
      return (
        <Alert
          message="No Constituents"
          description={
            record.computed
              ? 'This is a computed analyte but has no constituents defined.'
              : 'This is not a computed analyte.'
          }
          type="info"
          showIcon
        />
      );
    }

    const constituentColumns: EditableColumn[] = [
      {
        title: 'Constituent Analyte',
        dataIndex: 'analyteId',
        key: 'analyteId',
        editable: true,
        inputType: 'select',
        options: selectors.compounds.map(compound => ({
          value: compound.id,
          label: compound.label,
        })),
        render: (id: number) => {
          const compound = selectors.compounds.find(c => c.id === id);
          return compound ? compound.label : `ID: ${id}`;
        },
        rules: [{ required: true, message: 'Please select a constituent analyte' }],
      },
    ];

    return (
      <div style={{ padding: '0 20px' }}>
        <EditableTable
          columns={constituentColumns}
          dataSource={record.computedAnalyteConstituentRss}
          rowKey="computedAnalyteConstituentId"
          editable={editing}
          size="small"
          pagination={false}
          onSave={() => {}} // Would handle constituent save
          onDelete={() => {}} // Would handle constituent delete
        />
      </div>
    );
  };

  return (
    <CardSection title="Analytes" style={stylePresets.contentCard}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAnalyte}>
            Add Analyte
          </Button>
        </div>
      )}

      {sopData.analyticalBatchSopAnalytesRss.length === 0 ? (
        <Alert
          message="No Analytes"
          description={
            editing
              ? "Click 'Add Analyte' to define analytes for this SOP."
              : "This SOP doesn't have any analytes defined."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={sopData.analyticalBatchSopAnalytesRss}
          rowKey="analyticalBatchSopAnalyteId"
          expandable={{
            expandedRowRender,
            rowExpandable: record => record.computed,
          }}
          pagination={{ pageSize: 10 }}
          size="small"
          onSave={handleSaveAnalyte}
          onDelete={handleDeleteAnalyte}
          editable={editing}
        />
      )}
    </CardSection>
  );
};

// Control Samples Tab Component
interface ControlSamplesTabProps {
  sopData: AnalyticalBatchSopRs;
  selectors: SopMaintenanceSelectors | null;
  editing: boolean;
  onControlSamplesChange: (controlSamples: AnalyticalBatchSopControlSampleRs[]) => void;
}

const ControlSamplesTab: React.FC<ControlSamplesTabProps> = ({
  sopData,
  selectors,
  editing,
  onControlSamplesChange,
}) => {
  if (!selectors) return <Spin />;

  // Handle adding a new control sample
  const handleAddControlSample = () => {
    const newControlSample: AnalyticalBatchSopControlSampleRs = {
      analyticalBatchSopControlSampleId: -Date.now(),
      analyticalBatchSopId: sopData.batchSopId,
      sopBatchPositionType: null,
      everyNSamples: null,
      controlSampleOrder: null,
      qCFactor1: null,
      qCFactor2: null,
      qCTargetRangeLow: null,
      qCTargetRangeHigh: null,
      historicalDays: null,
      controlSampleAnalyteSopSpecificationRss: [],
    };

    onControlSamplesChange([...sopData.analyticalBatchSopControlSampleRss, newControlSample]);
  };

  // Handle saving a control sample
  const handleSaveControlSample = (controlSample: AnalyticalBatchSopControlSampleRs) => {
    // Simulate an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Control sample saved successfully');

        // Update the control samples by replacing the edited one
        const updatedControlSamples = sopData.analyticalBatchSopControlSampleRss.map(cs =>
          cs.analyticalBatchSopControlSampleId === controlSample.analyticalBatchSopControlSampleId
            ? controlSample
            : cs
        );

        // If it's a new record (negative ID), replace it with a "saved" version
        if (controlSample.analyticalBatchSopControlSampleId < 0) {
          const savedControlSample = {
            ...controlSample,
            analyticalBatchSopControlSampleId: Math.floor(Math.random() * 1000) + 100,
          };

          const filteredControlSamples = updatedControlSamples.filter(
            cs =>
              cs.analyticalBatchSopControlSampleId !==
              controlSample.analyticalBatchSopControlSampleId
          );

          onControlSamplesChange([...filteredControlSamples, savedControlSample]);
        } else {
          onControlSamplesChange(updatedControlSamples);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting a control sample
  const handleDeleteControlSample = (controlSample: AnalyticalBatchSopControlSampleRs) => {
    const updatedControlSamples = sopData.analyticalBatchSopControlSampleRss.filter(
      cs => cs.analyticalBatchSopControlSampleId !== controlSample.analyticalBatchSopControlSampleId
    );

    onControlSamplesChange(updatedControlSamples);
    message.success('Control sample deleted successfully');
  };

  // Define columns for the control samples table
  const columns: EditableColumn[] = [
    {
      title: 'Position Type',
      dataIndex: 'sopBatchPositionType',
      key: 'sopBatchPositionType',
      editable: true,
      inputType: 'select',
      options: selectors.sopBatchPositionTypes.map(type => ({
        value: type.id,
        label: type.label,
      })),
      render: (id: number | null) => {
        if (!id) return <Text type="secondary">Not selected</Text>;
        const positionType = selectors.sopBatchPositionTypes.find(t => t.id === id);
        return positionType ? positionType.label : `ID: ${id}`;
      },
      rules: [{ required: true, message: 'Please select a position type' }],
    },
    {
      title: 'Every N Samples',
      dataIndex: 'everyNSamples',
      key: 'everyNSamples',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
      rules: [{ required: true, message: 'Please enter a value' }],
    },
    {
      title: 'Control Sample Order',
      dataIndex: 'controlSampleOrder',
      key: 'controlSampleOrder',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
      rules: [{ required: true, message: 'Please enter an order' }],
    },
    {
      title: 'QC Target Range Low',
      dataIndex: 'qCTargetRangeLow',
      key: 'qCTargetRangeLow',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'QC Target Range High',
      dataIndex: 'qCTargetRangeHigh',
      key: 'qCTargetRangeHigh',
      editable: true,
      inputType: 'number',
      render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Specifications',
      dataIndex: 'controlSampleAnalyteSopSpecificationRss',
      key: 'specifications',
      editable: false,
      render: (specs: any[]) => specs?.length ?? 0,
    },
  ];

  // Component for expanded row to show specifications
  const expandedRowRender = (record: AnalyticalBatchSopControlSampleRs) => {
    if (!record.controlSampleAnalyteSopSpecificationRss?.length) {
      return (
        <Alert
          message="No Specifications"
          description="No analyte specifications defined for this control sample."
          type="info"
          showIcon
        />
      );
    }

    const specColumns: EditableColumn[] = [
      {
        title: 'Analyte',
        dataIndex: 'analyteId',
        key: 'analyteId',
        editable: true,
        inputType: 'select',
        options: selectors.compounds.map(compound => ({
          value: compound.id,
          label: compound.label,
        })),
        render: (id: number | null) => {
          if (!id) return <Text type="secondary">Not selected</Text>;
          const compound = selectors.compounds.find(c => c.id === id);
          return compound ? compound.label : `ID: ${id}`;
        },
        rules: [{ required: true, message: 'Please select an analyte' }],
      },
      {
        title: 'Expected Recovery',
        dataIndex: 'expectedRecovery',
        key: 'expectedRecovery',
        editable: true,
        inputType: 'number',
        render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
      },
      {
        title: 'QC Type',
        dataIndex: 'qCType',
        key: 'qCType',
        editable: true,
        inputType: 'number',
        render: (value: number | null) => value ?? <Text type="secondary">Not set</Text>,
      },
    ];

    return (
      <div style={{ padding: '0 20px' }}>
        <EditableTable
          columns={specColumns}
          dataSource={record.controlSampleAnalyteSopSpecificationRss}
          rowKey="controlSampleAnalyteSopSpecificationId"
          editable={editing}
          size="small"
          pagination={false}
          onSave={() => {}} // Would handle spec save
          onDelete={() => {}} // Would handle spec delete
        />
      </div>
    );
  };

  return (
    <CardSection title="Control Samples" style={stylePresets.contentCard}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddControlSample}>
            Add Control Sample
          </Button>
        </div>
      )}

      {sopData.analyticalBatchSopControlSampleRss.length === 0 ? (
        <Alert
          message="No Control Samples"
          description={
            editing
              ? "Click 'Add Control Sample' to define control samples for this SOP."
              : "This SOP doesn't have any control samples defined."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={sopData.analyticalBatchSopControlSampleRss}
          rowKey="analyticalBatchSopControlSampleId"
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          pagination={{ pageSize: 10 }}
          size="small"
          onSave={handleSaveControlSample}
          onDelete={handleDeleteControlSample}
          editable={editing}
        />
      )}
    </CardSection>
  );
};

// Review Components Tab Component
interface ReviewComponentsTabProps {
  sopData: AnalyticalBatchSopRs;
  editing: boolean;
  onReviewComponentsChange: (components: SopAnalysisReviewComponentRs[]) => void;
}

const ReviewComponentsTab: React.FC<ReviewComponentsTabProps> = ({
  sopData,
  editing,
  onReviewComponentsChange,
}) => {
  // Handle adding a new review component
  const handleAddReviewComponent = () => {
    const newComponent: SopAnalysisReviewComponentRs = {
      sopAnalysisReviewComponentId: -Date.now(),
      analyticalBatchSopId: sopData.batchSopId,
      componentName: '',
      displayName: '',
      parameter: '',
      collection: '',
    };

    onReviewComponentsChange([...sopData.sopAnalysisReviewComponentRss, newComponent]);
  };

  // Handle saving a review component
  const handleSaveReviewComponent = (component: SopAnalysisReviewComponentRs) => {
    // Simulate an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Review component saved successfully');

        // Update the review components by replacing the edited one
        const updatedComponents = sopData.sopAnalysisReviewComponentRss.map(c =>
          c.sopAnalysisReviewComponentId === component.sopAnalysisReviewComponentId ? component : c
        );

        // If it's a new record (negative ID), replace it with a "saved" version
        if (component.sopAnalysisReviewComponentId < 0) {
          const savedComponent = {
            ...component,
            sopAnalysisReviewComponentId: Math.floor(Math.random() * 1000) + 100,
          };

          const filteredComponents = updatedComponents.filter(
            c => c.sopAnalysisReviewComponentId !== component.sopAnalysisReviewComponentId
          );

          onReviewComponentsChange([...filteredComponents, savedComponent]);
        } else {
          onReviewComponentsChange(updatedComponents);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting a review component
  const handleDeleteReviewComponent = (component: SopAnalysisReviewComponentRs) => {
    const updatedComponents = sopData.sopAnalysisReviewComponentRss.filter(
      c => c.sopAnalysisReviewComponentId !== component.sopAnalysisReviewComponentId
    );

    onReviewComponentsChange(updatedComponents);
    message.success('Review component deleted successfully');
  };

  // Define columns for the review components table
  const columns: EditableColumn[] = [
    {
      title: 'Component Name',
      dataIndex: 'componentName',
      key: 'componentName',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || <Text type="secondary">Not set</Text>,
      rules: [
        { required: true, message: 'Please enter component name' },
        { max: 150, message: 'Component name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || <Text type="secondary">Not set</Text>,
      rules: [
        { required: true, message: 'Please enter display name' },
        { max: 150, message: 'Display name cannot exceed 150 characters' },
      ],
    },
    {
      title: 'Parameter',
      dataIndex: 'parameter',
      key: 'parameter',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || <Text type="secondary">Not set</Text>,
      rules: [{ max: 150, message: 'Parameter cannot exceed 150 characters' }],
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection',
      editable: true,
      inputType: 'text',
      render: (text: string) => text || <Text type="secondary">Not set</Text>,
      rules: [{ max: 150, message: 'Collection cannot exceed 150 characters' }],
    },
  ];

  return (
    <CardSection title="Analysis Review Components" style={stylePresets.contentCard}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddReviewComponent}>
            Add Review Component
          </Button>
        </div>
      )}

      {sopData.sopAnalysisReviewComponentRss.length === 0 ? (
        <Alert
          message="No Review Components"
          description={
            editing
              ? "Click 'Add Review Component' to define review components for this SOP."
              : "This SOP doesn't have any review components defined."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={sopData.sopAnalysisReviewComponentRss}
          rowKey="sopAnalysisReviewComponentId"
          pagination={{ pageSize: 10 }}
          size="small"
          onSave={handleSaveReviewComponent}
          onDelete={handleDeleteReviewComponent}
          editable={editing}
        />
      )}
    </CardSection>
  );
};

// Prep Batch SOPs Tab Component
interface PrepBatchSopsTabProps {
  sopData: AnalyticalBatchSopRs;
  selectors: SopMaintenanceSelectors | null;
  editing: boolean;
  onPrepBatchSopsChange: (prepBatchSops: PrepBatchSopAnalyticalBatchSopRs[]) => void;
}

const PrepBatchSopsTab: React.FC<PrepBatchSopsTabProps> = ({
  sopData,
  selectors,
  editing,
  onPrepBatchSopsChange,
}) => {
  if (!selectors) return <Spin />;

  // Handle adding a new prep batch SOP link
  const handleAddPrepBatchSop = () => {
    const newPrepBatchSop: PrepBatchSopAnalyticalBatchSopRs = {
      prepBatchSopAnalyticalBatchSopId: -Date.now(),
      prepBatchSopId: null,
      analyticalBatchSopId: sopData.batchSopId,
      effectiveDate: dayjs().toISOString(),
    };

    onPrepBatchSopsChange([...sopData.prepBatchSopAnalyticalBatchSopRss, newPrepBatchSop]);
  };

  // Handle saving a prep batch SOP link
  const handleSavePrepBatchSop = (prepBatchSop: PrepBatchSopAnalyticalBatchSopRs) => {
    // Simulate an API call
    return new Promise<void>(resolve => {
      setTimeout(() => {
        message.success('Prep Batch SOP link saved successfully');

        // Update the prep batch SOP links by replacing the edited one
        const updatedPrepBatchSops = sopData.prepBatchSopAnalyticalBatchSopRss.map(p =>
          p.prepBatchSopAnalyticalBatchSopId === prepBatchSop.prepBatchSopAnalyticalBatchSopId
            ? prepBatchSop
            : p
        );

        // If it's a new record (negative ID), replace it with a "saved" version
        if (prepBatchSop.prepBatchSopAnalyticalBatchSopId < 0) {
          const savedPrepBatchSop = {
            ...prepBatchSop,
            prepBatchSopAnalyticalBatchSopId: Math.floor(Math.random() * 1000) + 100,
          };

          const filteredPrepBatchSops = updatedPrepBatchSops.filter(
            p =>
              p.prepBatchSopAnalyticalBatchSopId !== prepBatchSop.prepBatchSopAnalyticalBatchSopId
          );

          onPrepBatchSopsChange([...filteredPrepBatchSops, savedPrepBatchSop]);
        } else {
          onPrepBatchSopsChange(updatedPrepBatchSops);
        }

        resolve();
      }, 500);
    });
  };

  // Handle deleting a prep batch SOP link
  const handleDeletePrepBatchSop = (prepBatchSop: PrepBatchSopAnalyticalBatchSopRs) => {
    const updatedPrepBatchSops = sopData.prepBatchSopAnalyticalBatchSopRss.filter(
      p => p.prepBatchSopAnalyticalBatchSopId !== prepBatchSop.prepBatchSopAnalyticalBatchSopId
    );

    onPrepBatchSopsChange(updatedPrepBatchSops);
    message.success('Prep Batch SOP link deleted successfully');
  };

  // Define columns for the prep batch SOPs table
  const columns: EditableColumn[] = [
    {
      title: 'Prep Batch SOP',
      dataIndex: 'prepBatchSopId',
      key: 'prepBatchSopId',
      editable: true,
      inputType: 'select',
      options: selectors.prepBatchSops.map(sop => ({
        value: sop.id,
        label: sop.label,
      })),
      render: (id: number | null) => {
        if (!id) return <Text type="secondary">Not selected</Text>;
        const prepBatchSop = selectors.prepBatchSops.find(s => s.id === id);
        return prepBatchSop ? prepBatchSop.label : `ID: ${id}`;
      },
      rules: [{ required: true, message: 'Please select a prep batch SOP' }],
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      editable: true,
      inputType: 'date',
      render: (date: string) => {
        if (!date || date === 'datetime.MaxValue') return <Text type="secondary">Not set</Text>;
        try {
          return dayjs(date).format('MM/DD/YYYY');
        } catch (e) {
          return 'Invalid date';
        }
      },
      rules: [{ required: true, message: 'Please select an effective date' }],
    },
  ];

  return (
    <CardSection title="Linked Prep Batch SOPs" style={stylePresets.contentCard}>
      {editing && (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPrepBatchSop}>
            Add Prep Batch SOP Link
          </Button>
        </div>
      )}

      {sopData.prepBatchSopAnalyticalBatchSopRss.length === 0 ? (
        <Alert
          message="No Linked Prep Batch SOPs"
          description={
            editing
              ? "Click 'Add Prep Batch SOP Link' to link prep batch SOPs to this analytical SOP."
              : "This analytical SOP doesn't have any linked prep batch SOPs."
          }
          type="info"
          showIcon
        />
      ) : (
        <EditableTable
          columns={columns}
          dataSource={sopData.prepBatchSopAnalyticalBatchSopRss}
          rowKey="prepBatchSopAnalyticalBatchSopId"
          pagination={{ pageSize: 10 }}
          size="small"
          onSave={handleSavePrepBatchSop}
          onDelete={handleDeletePrepBatchSop}
          editable={editing}
        />
      )}
    </CardSection>
  );
};

export default AnalyticalBatchSopDetail;
