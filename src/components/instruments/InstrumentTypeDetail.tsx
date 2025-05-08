import React, { useState, useEffect } from 'react';

import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
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
  Switch,
  Checkbox,
} from 'antd';

import appConfig from '../../config/appConfig';
import { stylePresets } from '../../config/theme';
import { InstrumentTypeRs, ConfigurationMaintenanceSelectors } from '../../models/types';
import CardSection from '../common/CardSection';
import FormItem from '../common/FormItem';

import AnalytesTab from './tabs/AnalytesTab';
import InstrumentsTab from './tabs/InstrumentsTab';


const { TabPane } = Tabs;
const { Option } = Select;

interface InstrumentTypeDetailProps {
  instrumentType: InstrumentTypeRs;
  selectors: ConfigurationMaintenanceSelectors;
  onUpdate: (instrumentType: InstrumentTypeRs) => void;
  onBack: () => void;
  showInactive?: boolean;
  onShowInactiveChange?: (checked: boolean) => void;
  saving?: boolean;
}

const InstrumentTypeDetail: React.FC<InstrumentTypeDetailProps> = ({
  instrumentType,
  selectors,
  onUpdate,
  onBack,
  showInactive = false,
  onShowInactiveChange,
  saving = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [editing, setEditing] = useState(instrumentType.instrumentTypeId < 0); // Auto-edit for new records
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
      // We don't set saving state here as it's controlled by the parent
      // Remove the line: setSaving(true);

      // Validate form
      const values = await form.validateFields();

      // Create updated instrument type object
      const updatedInstrumentType: InstrumentTypeRs = {
        ...currentInstrumentType,
        ...values,
        // Always ensure labId is set correctly from config
        labId: appConfig.api.defaultLabId,
      };

      // Call parent update handler
      onUpdate(updatedInstrumentType);
      setCurrentInstrumentType(updatedInstrumentType);
      setEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    }
    // We don't need to set saving back to false here
    // Remove the line: setSaving(false);
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
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
          {onShowInactiveChange && (
            <Checkbox checked={showInactive} onChange={e => onShowInactiveChange(e.target.checked)}>
              Show Inactive
            </Checkbox>
          )}
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
                          <Option key={type.id} value={type.label}>
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
                  <Col span={12}>
                    <FormItem
                      name="active"
                      label="Active"
                      tooltip="Whether this instrument type is active and should be displayed by default"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        defaultChecked={currentInstrumentType.active !== false}
                      />
                    </FormItem>
                  </Col>
                </Row>

                {/* Hidden field for labId */}
                <Form.Item name="labId" hidden>
                  <InputNumber />
                </Form.Item>
              </CardSection>
            </TabPane>

            <TabPane tab="Instruments" key="instruments">
              <CardSection title="Instruments">
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  {onShowInactiveChange && (
                    <Checkbox
                      checked={showInactive}
                      onChange={e => onShowInactiveChange(e.target.checked)}
                    >
                      Show Inactive
                    </Checkbox>
                  )}
                </div>
                <InstrumentsTab
                  instruments={currentInstrumentType.instrumentRss}
                  instrumentTypeId={currentInstrumentType.instrumentTypeId}
                  selectors={selectors}
                  onChange={handleInstrumentsChange}
                  showInactive={showInactive}
                  editing={editing}
                />
              </CardSection>
            </TabPane>

            <TabPane tab="Analytes" key="analytes">
              <CardSection title="Analytes">
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  {onShowInactiveChange && (
                    <Checkbox
                      checked={showInactive}
                      onChange={e => onShowInactiveChange(e.target.checked)}
                    >
                      Show Inactive
                    </Checkbox>
                  )}
                </div>
                <AnalytesTab
                  analytes={currentInstrumentType.instrumentTypeAnalyteRss}
                  instrumentTypeId={currentInstrumentType.instrumentTypeId}
                  selectors={selectors}
                  onChange={handleAnalytesChange}
                  showInactive={showInactive}
                  editing={editing}
                />
              </CardSection>
            </TabPane>
          </Tabs>
        </Form>
      </div>
    </Spin>
  );
};

export default InstrumentTypeDetail;
