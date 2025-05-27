import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  onChange?: (instrumentType: InstrumentTypeRs) => void; // New prop for real-time changes
  onBack: () => void;
  showInactive?: boolean;
  onShowInactiveChange?: (checked: boolean) => void;
  saving?: boolean;
}

const InstrumentTypeDetail: React.FC<InstrumentTypeDetailProps> = ({
  instrumentType,
  selectors,
  onUpdate,
  onChange, // New prop for real-time changes
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

  // Use a ref to track the latest changes without triggering re-renders
  const latestChangesRef = useRef<InstrumentTypeRs>(instrumentType);
  const changeTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced function to notify parent of changes
  const debouncedNotifyChange = useCallback(() => {
    if (onChange && latestChangesRef.current) {
      console.log('📤 Notifying parent of debounced changes:', latestChangesRef.current.name);
      onChange(latestChangesRef.current);
    }
  }, [onChange]);

  // Set form values when instrument type changes from parent
  useEffect(() => {
    // Only update if this is a different instrument type (not our own changes coming back)
    if (instrumentType.instrumentTypeId !== currentInstrumentType.instrumentTypeId) {
      console.log('🔄 Instrument type changed from parent, updating form');
      form.setFieldsValue(instrumentType);
      setCurrentInstrumentType(instrumentType);
      latestChangesRef.current = instrumentType;
      setEditing(instrumentType.instrumentTypeId < 0);
    }
  }, [form, instrumentType, currentInstrumentType.instrumentTypeId]);

  // Handle form field changes in real-time
  const handleFormChange = (changedFields: any, allFields: any) => {
    if (!editing) return;

    // Update local state immediately for responsive UI
    const updatedType = {
      ...currentInstrumentType,
      ...allFields,
      labId: appConfig.api.defaultLabId,
    };

    console.log('📝 Form field changed:', {
      field: Object.keys(changedFields)[0],
      value: Object.values(changedFields)[0],
    });

    setCurrentInstrumentType(updatedType);
    latestChangesRef.current = updatedType;

    // Clear existing timeout and set a new one
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    // Debounce the parent notification to avoid constant re-renders
    changeTimeoutRef.current = setTimeout(() => {
      debouncedNotifyChange();
    }, 500); // 500ms delay
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      // Validate form
      const values = await form.validateFields();

      // Create updated instrument type object
      const updatedInstrumentType: InstrumentTypeRs = {
        ...currentInstrumentType,
        ...values,
        // Always ensure labId is set correctly from config
        labId: appConfig.api.defaultLabId,
      };

      console.log('💾 Saving instrument type:', updatedInstrumentType.name);

      // Call parent update handler
      onUpdate(updatedInstrumentType);
      setCurrentInstrumentType(updatedInstrumentType);
      setEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    // Clear any pending debounced changes
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    form.setFieldsValue(instrumentType);
    setCurrentInstrumentType(instrumentType);
    latestChangesRef.current = instrumentType;
    setEditing(false);

    // Reset to original state and notify parent
    if (onChange) {
      onChange(instrumentType);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  // Handle changes to instruments
  const handleInstrumentsChange = (instruments: any[]) => {
    const updatedType = {
      ...currentInstrumentType,
      instrumentRss: instruments,
    };

    setCurrentInstrumentType(updatedType);
    latestChangesRef.current = updatedType;

    // For child component changes, notify immediately (these are less frequent)
    if (onChange) {
      onChange(updatedType);
    }
  };

  // Handle changes to analytes
  const handleAnalytesChange = (analytes: any[]) => {
    const updatedType = {
      ...currentInstrumentType,
      instrumentTypeAnalyteRss: analytes,
    };

    setCurrentInstrumentType(updatedType);
    latestChangesRef.current = updatedType;

    // For child component changes, notify immediately (these are less frequent)
    if (onChange) {
      onChange(updatedType);
    }
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
          onValuesChange={handleFormChange} // Add real-time change handler
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
