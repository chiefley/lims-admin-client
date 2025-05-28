import React, { useState, useEffect } from 'react';

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
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
  editMode?: boolean;
  onValidationChange?: (tabKey: string, hasErrors: boolean, errorMessage?: string) => void;
}

interface TabValidationError {
  tabKey: string;
  hasErrors: boolean;
  errorMessage?: string;
}

const InstrumentTypeDetail: React.FC<InstrumentTypeDetailProps> = ({
  instrumentType,
  selectors,
  onUpdate,
  onBack,
  showInactive = false,
  onShowInactiveChange,
  saving = false,
  editMode = false,
  onValidationChange,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [currentInstrumentType, setCurrentInstrumentType] =
    useState<InstrumentTypeRs>(instrumentType);
  const [tabValidationErrors, setTabValidationErrors] = useState<TabValidationError[]>([]);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);

  // Update when props change
  useEffect(() => {
    form.setFieldsValue(instrumentType);
    setCurrentInstrumentType(instrumentType);
  }, [form, instrumentType]);

  // Tab validation function
  const validateTab = (tabKey: string): TabValidationError => {
    const errors: string[] = [];

    switch (tabKey) {
      case 'basic':
        if (!currentInstrumentType.name?.trim()) errors.push('Name is required');
        if (!currentInstrumentType.measurementType?.trim())
          errors.push('Measurement Type is required');
        if (!currentInstrumentType.dataFolder?.trim()) errors.push('Data Folder is required');
        if (!currentInstrumentType.instrumentFileParser)
          errors.push('File Parser Type is required');

        // Additional basic validations
        if (currentInstrumentType.name && currentInstrumentType.name.length > 150) {
          errors.push('Name cannot exceed 150 characters');
        }
        if (
          currentInstrumentType.measurementType &&
          currentInstrumentType.measurementType.length > 150
        ) {
          errors.push('Measurement Type cannot exceed 150 characters');
        }
        if (currentInstrumentType.dataFolder && currentInstrumentType.dataFolder.length > 250) {
          errors.push('Data Folder cannot exceed 250 characters');
        }
        break;

      case 'instruments':
        currentInstrumentType.instrumentRss?.forEach((instrument, index) => {
          if (!instrument.name?.trim()) {
            errors.push(`Instrument #${index + 1} name is required`);
          }
          if (instrument.name && instrument.name.length > 150) {
            errors.push(`Instrument #${index + 1} name cannot exceed 150 characters`);
          }
          // Validate dates
          if (instrument.lastPM && instrument.nextPm) {
            const lastPM = new Date(instrument.lastPM);
            const nextPM = new Date(instrument.nextPm);
            if (nextPM <= lastPM) {
              errors.push(`Instrument #${index + 1}: Next PM must be after Last PM`);
            }
          }
        });
        break;

      case 'analytes':
        currentInstrumentType.instrumentTypeAnalyteRss?.forEach((analyte, index) => {
          if (!analyte.analyteId) {
            errors.push(`Analyte #${index + 1} selection is required`);
          }
          if (!analyte.analyteAlias?.trim()) {
            errors.push(`Analyte #${index + 1} alias is required`);
          }
          if (analyte.analyteAlias && analyte.analyteAlias.length > 150) {
            errors.push(`Analyte #${index + 1} alias cannot exceed 150 characters`);
          }
        });

        // Check for duplicate analyte aliases within this instrument type
        const aliases = currentInstrumentType.instrumentTypeAnalyteRss
          ?.map(a => a.analyteAlias?.trim().toLowerCase())
          .filter(alias => alias);

        if (aliases && aliases.length !== new Set(aliases).size) {
          errors.push('Analyte aliases must be unique within this instrument type');
        }
        break;
    }

    return {
      tabKey,
      hasErrors: errors.length > 0,
      errorMessage: errors.length > 0 ? errors.join(', ') : undefined,
    };
  };

  // Update tab validation when data changes
  useEffect(() => {
    if (!editMode) {
      setTabValidationErrors([]);
      return;
    }

    const basicValidation = validateTab('basic');
    const instrumentsValidation = validateTab('instruments');
    const analytesValidation = validateTab('analytes');

    const newValidationErrors = [basicValidation, instrumentsValidation, analytesValidation];
    setTabValidationErrors(newValidationErrors);

    // Notify parent of validation changes
    if (onValidationChange) {
      newValidationErrors.forEach(validation => {
        onValidationChange(validation.tabKey, validation.hasErrors, validation.errorMessage);
      });
    }
  }, [currentInstrumentType, editMode, onValidationChange]);

  // Handle tab switching with validation
  const handleTabChange = (newTabKey: string) => {
    if (!editMode) {
      setActiveTab(newTabKey);
      return;
    }

    // Check current tab for errors
    const currentTabValidation = tabValidationErrors.find(e => e.tabKey === activeTab);

    if (currentTabValidation?.hasErrors) {
      message.error(`Cannot switch tabs: ${currentTabValidation.errorMessage}`);
      setPendingTabSwitch(newTabKey);
      return;
    }

    setActiveTab(newTabKey);
    setPendingTabSwitch(null);
  };

  // Handle form field changes
  const handleFieldChange = () => {
    if (!editMode) return;

    // Update current instrument type with form values
    const formValues = form.getFieldsValue();
    const updatedType = {
      ...currentInstrumentType,
      ...formValues,
      labId: appConfig.api.defaultLabId,
    };

    setCurrentInstrumentType(updatedType);
    onUpdate(updatedType);
  };

  // Handle changes to instruments
  const handleInstrumentsChange = (instruments: any[]) => {
    if (!editMode) {
      message.warning('Cannot modify instruments - not in edit mode');
      return;
    }

    console.log('🔧 handleInstrumentsChange called:', {
      instrumentCount: instruments.length,
      instrumentNames: instruments.map(i => i.name || 'New'),
    });

    const updatedType = {
      ...currentInstrumentType,
      instrumentRss: instruments,
    };

    setCurrentInstrumentType(updatedType);
    onUpdate(updatedType);
  };

  // Handle changes to analytes
  const handleAnalytesChange = (analytes: any[]) => {
    if (!editMode) {
      message.warning('Cannot modify analytes - not in edit mode');
      return;
    }

    console.log('🧪 handleAnalytesChange called:', {
      analyteCount: analytes.length,
      analyteAliases: analytes.map(a => a.analyteAlias || 'New'),
    });

    const updatedType = {
      ...currentInstrumentType,
      instrumentTypeAnalyteRss: analytes,
    };

    setCurrentInstrumentType(updatedType);
    onUpdate(updatedType);
  };

  // Get tab status indicator
  const getTabStatus = (tabKey: string) => {
    if (!editMode) return null;

    const tabError = tabValidationErrors.find(e => e.tabKey === tabKey);
    if (tabError?.hasErrors) {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginLeft: 4 }} />;
    }
    return <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />;
  };

  // Get tab title with validation status
  const getTabTitle = (title: string, tabKey: string) => {
    return (
      <span>
        {title}
        {getTabStatus(tabKey)}
      </span>
    );
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
            {editMode && (
              <div style={{ color: '#1890ff', fontWeight: 500 }}>✏️ Edit Mode Active</div>
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
          disabled={!editMode}
          onValuesChange={handleFieldChange}
        >
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab={getTabTitle('Basic Information', 'basic')} key="basic">
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

            <TabPane tab={getTabTitle('Instruments', 'instruments')} key="instruments">
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
                  editing={editMode}
                />
              </CardSection>
            </TabPane>

            <TabPane tab={getTabTitle('Analytes', 'analytes')} key="analytes">
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
                  editing={editMode}
                />
              </CardSection>
            </TabPane>
          </Tabs>
        </Form>

        {/* Show validation summary if there are errors */}
        {editMode && tabValidationErrors.some(e => e.hasErrors) && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                padding: '12px 16px',
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: 8, color: '#cf1322' }}>
                ⚠️ Validation Errors:
              </div>
              {tabValidationErrors
                .filter(e => e.hasErrors)
                .map(error => (
                  <div key={error.tabKey} style={{ color: '#cf1322', fontSize: '14px' }}>
                    •{' '}
                    <strong>
                      {error.tabKey === 'basic'
                        ? 'Basic Information'
                        : error.tabKey === 'instruments'
                        ? 'Instruments'
                        : 'Analytes'}
                      :
                    </strong>{' '}
                    {error.errorMessage}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};

export default InstrumentTypeDetail;
