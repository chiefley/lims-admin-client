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
  SopMaintenanceSelectors,
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
  selectors: SopMaintenanceSelectors;
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [localInstrumentType, setLocalInstrumentType] = useState<InstrumentTypeRs>(instrumentType);

  // Set form values when instrumentType changes
  useEffect(() => {
    form.setFieldsValue({
      ...instrumentType,
    });
    setLocalInstrumentType(instrumentType);
  }, [form, instrumentType]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate form fields
      const values = await form.validateFields();

      // Create updated instrument type with form values
      const updatedInstrumentType = {
        ...localInstrumentType,
        ...values,
      };

      // Call parent update handler
      onUpdate(updatedInstrumentType);

      setLoading(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
      setLoading(false);
    }
  };

  // Handle instrument updates from the instruments tab
  const handleInstrumentsChange = (instruments: any[]) => {
    setLocalInstrumentType(prev => ({
      ...prev,
      instrumentRss: instruments,
    }));
  };

  // Handle analytes updates from the analytes tab
  const handleAnalytesChange = (analytes: any[]) => {
    setLocalInstrumentType(prev => ({
      ...prev,
      instrumentTypeAnalyteRss: analytes,
    }));
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} layout="vertical" initialValues={instrumentType}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back to List
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
              Save Changes
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Basic Information" key="basic">
            <CardSection title="Instrument Type Details" style={stylePresets.contentCard}>
              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    name="name"
                    label="Name"
                    tooltip="Name of the instrument type"
                    rules={[
                      { required: true, message: 'Please enter instrument type name' },
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
                    tooltip="Type of measurement performed by this instrument"
                    rules={[
                      { required: true, message: 'Please enter measurement type' },
                      { max: 150, message: 'Measurement type cannot exceed 150 characters' },
                    ]}
                  >
                    <Input placeholder="Enter measurement type" />
                  </FormItem>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    name="dataFolder"
                    label="Data Folder"
                    tooltip="Folder path where instrument data is stored"
                    rules={[
                      { required: true, message: 'Please enter data folder path' },
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
                    tooltip="Parser used to process instrument data files"
                    rules={[{ required: true, message: 'Please select file parser type' }]}
                  >
                    <Select placeholder="Select file parser type">
                      {selectors.instrumentFileParserTypes?.map(parser => (
                        <Option key={parser.id} value={parser.id}>
                          {parser.label}
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
                    tooltip="Threshold value for peak area saturation"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter threshold value"
                      min={0}
                    />
                  </FormItem>
                </Col>
              </Row>
            </CardSection>
          </TabPane>

          <TabPane tab="Instruments" key="instruments">
            <InstrumentsTab
              instruments={localInstrumentType.instrumentRss || []}
              instrumentTypeId={localInstrumentType.instrumentTypeId}
              selectors={selectors}
              onChange={handleInstrumentsChange}
            />
          </TabPane>

          <TabPane tab="Analytes" key="analytes">
            <AnalytesTab
              analytes={localInstrumentType.instrumentTypeAnalyteRss || []}
              instrumentTypeId={localInstrumentType.instrumentTypeId}
              selectors={selectors}
              onChange={handleAnalytesChange}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Spin>
  );
};

export default InstrumentTypeDetail;
