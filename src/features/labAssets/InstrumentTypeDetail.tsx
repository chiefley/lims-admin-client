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
import { ConfigurationMaintenanceSelectors } from '../../features/shared/types/common';
import CardSection from '../shared/components/CardSection';
import FormItem from '../shared/components/FormItem';

import AnalytesTab from './AnalytesTab';
import InstrumentsTab from './InstrumentsTab';
import { InstrumentTypeRs } from './types';

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
  const [editing, setEditing] = useState(instrumentType.instrumentTypeId < 0);
  const [loading, setLoading] = useState(false);
  const [currentInstrumentType, setCurrentInstrumentType] =
    useState<InstrumentTypeRs>(instrumentType);

  // Update when props change
  useEffect(() => {
    form.setFieldsValue(instrumentType);
    setCurrentInstrumentType(instrumentType);
    setEditing(instrumentType.instrumentTypeId < 0);
  }, [form, instrumentType]);

  // Handle form submission/save
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const updatedInstrumentType: InstrumentTypeRs = {
        ...currentInstrumentType,
        ...values,
        labId: appConfig.api.defaultLabId,
      };

      console.log('💾 Saving changes to instrument type:', updatedInstrumentType.name);

      onUpdate(updatedInstrumentType);
      setCurrentInstrumentType(updatedInstrumentType);
      setEditing(false);

      message.success('Changes saved successfully');
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    form.setFieldsValue(instrumentType);
    setCurrentInstrumentType(instrumentType);
    setEditing(false);
  };

  // Handle changes to instruments - update parent immediately
  const handleInstrumentsChange = (instruments: any[]) => {
    console.log('🔧 handleInstrumentsChange called:', {
      instrumentCount: instruments.length,
      instrumentNames: instruments.map(i => i.name || 'New'),
    });

    const updatedType = {
      ...currentInstrumentType,
      instrumentRss: instruments,
    };

    setCurrentInstrumentType(updatedType);

    console.log('🔧 Calling onUpdate for instruments change');
    onUpdate(updatedType); // Notify parent immediately
  };

  // Handle changes to analytes - update parent immediately
  const handleAnalytesChange = (analytes: any[]) => {
    console.log('🧪 handleAnalytesChange called:', {
      analyteCount: analytes.length,
      analyteAliases: analytes.map(a => a.analyteAlias || 'New'),
    });

    const updatedType = {
      ...currentInstrumentType,
      instrumentTypeAnalyteRss: analytes,
    };

    setCurrentInstrumentType(updatedType);

    console.log('🧪 Calling onUpdate for analytes change');
    onUpdate(updatedType); // Notify parent immediately
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
