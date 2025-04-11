import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Tabs,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  InstrumentTypeRs,
  ConfigurationMaintenanceSelectors,
  InstrumentFileParserType,
} from '../../models/types';
import CardSection from '../common/CardSection';
import FormItem from '../common/FormItem';
import { stylePresets } from '../../config/theme';
import InstrumentsTab from './tabs/InstrumentsTab';
import AnalytesTab from './tabs/AnalytesTab';

const { TabPane } = Tabs;
const { Option } = Select;

interface InstrumentTypeDetailProps {
  instrumentType: InstrumentTypeRs;
  selectors: ConfigurationMaintenanceSelectors;
  onUpdate: (instrumentType: InstrumentTypeRs) => void;
  onBack: () => void;
}

const InstrumentTypeDetail: React.FC<InstrumentTypeDetailProps> = ({
  instrumentType,
  selectors,
  onUpdate,
  onBack,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [editing, setEditing] = useState(instrumentType.instrumentTypeId < 0); // Auto-edit for new records
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentInstrumentType, setCurrentInstrumentType] =
    useState<InstrumentTypeRs>(instrumentType);

  // Set form values when instrument type changes
  useEffect(() => {
    form.setFieldsValue(instrumentType);
    setCurrentInstrumentType(instrumentType);
    // Auto enter edit mode for new records
    setEditing(instrumentType.instrumentTypeId < 0);
  }, [form, instrumentType]);

  // Handle form submission
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // Create updated instrument type object
      const updatedInstrumentType: InstrumentTypeRs = {
        ...currentInstrumentType,
        ...values,
      };

      // Call parent update handler
      onUpdate(updatedInstrumentType);
      setCurrentInstrumentType(updatedInstrumentType);
      setEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    form.setFieldsValue(currentInstrumentType);
    setEditing(false);
  };

  // Handle changes to instruments
  const handleInstrumentsChange = (instruments: any[]) => {
    setCurrentInstrumentType({
      ...currentInstrumentType,
      instrumentRss: instruments,
    });
  };

  // Handle changes to analytes
  const handleAnalytesChange = (analytes: any[]) => {
    setCurrentInstrumentType({
      ...currentInstrumentType,
      instrumentTypeAnalyteRss: analytes,
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="instrument-type-detail">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back to Instrument Types
            </Button>
            {editing ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
                <Button onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="primary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={currentInstrumentType}
          disabled={!editing}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Basic Information" key="basic">
              <CardSection title="Instrument Type Details" style={stylePresets.contentCard}>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      name="name"
                      label="Name"
                      tooltip="The name of the instrument type"
                      rules={[
                        { required: true, message: 'Please enter the instrument type name' },
                        { max: 150, message: 'Name cannot exceed 150 characters' },
                      ]}
                    >
                      <Input placeholder="Enter instrument type name" />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      name="measurementType"
                      label="Measurement Type"
                      tooltip="The type of measurement performed by this instrument"
                      rules={[
                        { required: true, message: 'Please enter the measurement type' },
                        { max: 150, message: 'Measurement type cannot exceed 150 characters' },
                      ]}
                    >
                      <Input placeholder="e.g., Chromatography, Spectroscopy" />
                    </FormItem>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      name="dataFolder"
                      label="Data Folder"
                      tooltip="The folder path where instrument data is stored"
                      rules={[
                        { required: true, message: 'Please enter the data folder path' },
                        { max: 250, message: 'Path cannot exceed 250 characters' },
                      ]}
                    >
                      <Input placeholder="Enter data folder path" />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      name="instrumentFileParser"
                      label="File Parser Type"
                      tooltip="The parser used to interpret instrument data files"
                      rules={[{ required: true, message: 'Please select a file parser type' }]}
                    >
                      <Select placeholder="Select file parser type">
                        {selectors.instrumentFileParserTypes.map(type => (
                          <Option key={type.id} value={type.id}>
                            {type.label}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      name="peakAreaSaturationThreshold"
                      label="Peak Area Saturation Threshold"
                      tooltip="The threshold value for peak area saturation"
                    >
                      <InputNumber style={{ width: '100%' }} min={0} step={1} />
                    </FormItem>
                  </Col>
                </Row>
              </CardSection>
            </TabPane>

            <TabPane tab="Instruments" key="instruments">
              <InstrumentsTab
                instruments={currentInstrumentType.instrumentRss}
                instrumentTypeId={currentInstrumentType.instrumentTypeId}
                selectors={selectors}
                onChange={handleInstrumentsChange}
              />
            </TabPane>

            <TabPane tab="Analytes" key="analytes">
              <AnalytesTab
                analytes={currentInstrumentType.instrumentTypeAnalyteRss}
                instrumentTypeId={currentInstrumentType.instrumentTypeId}
                selectors={selectors}
                onChange={handleAnalytesChange}
              />
            </TabPane>
          </Tabs>
        </Form>
      </div>
    </Spin>
  );
};

export default InstrumentTypeDetail;
