import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Divider,
  Row,
  Col,
  Space,
  Spin,
  message,
} from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { PanelRs, ConfigurationMaintenanceSelectors } from '../../models/types';
import FormItem from '../common/FormItem';

const { Option } = Select;

interface PanelEditDrawerProps {
  visible: boolean;
  panel: PanelRs | null;
  selectors: ConfigurationMaintenanceSelectors;
  onClose: () => void;
  onSave: (panel: PanelRs) => void;
}

const PanelEditDrawer: React.FC<PanelEditDrawerProps> = ({
  visible,
  panel,
  selectors,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState<boolean>(false);

  // Reset form when panel changes
  useEffect(() => {
    if (panel) {
      form.setFieldsValue({
        ...panel,
        // Convert array to format suitable for Select component
        childPanels: panel.childPanels || [],
        // Ensure active field is properly set
        active: panel.active !== false, // Default to true if undefined
      });
    }
  }, [panel, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate form
      const values = await form.validateFields();

      // Convert values like scaleFactor and decimalFormatType to the correct type
      const updatedValues = {
        ...values,
        scaleFactor:
          values.scaleFactor === null || values.scaleFactor === undefined
            ? 1.0
            : Number(values.scaleFactor),
        defaultExtractionVolumeMl: values.defaultExtractionVolumeMl
          ? Number(values.defaultExtractionVolumeMl)
          : null,
        defaultDilution: values.defaultDilution ? Number(values.defaultDilution) : null,
        significantDigits: values.significantDigits ? Number(values.significantDigits) : 2,
      };

      // Create updated panel object
      const updatedPanel: PanelRs = {
        ...panel!,
        ...updatedValues,
      };

      // Call parent save handler
      onSave(updatedPanel);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    } finally {
      setSaving(false);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Return null if no panel is being edited
  if (!panel) return null;

  return (
    <Drawer
      title={`Edit Panel: ${panel.name}`}
      open={visible}
      onClose={handleCancel}
      width={600}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel} icon={<CloseOutlined />} disabled={saving}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} icon={<SaveOutlined />} loading={saving}>
              Save Changes
            </Button>
          </Space>
        </div>
      }
    >
      <Spin spinning={saving}>
        <Form form={form} layout="vertical" initialValues={panel} requiredMark="optional">
          <Divider>Basic Information</Divider>
          <Row gutter={16}>
            <Col span={16}>
              <FormItem
                name="name"
                label="Panel Name"
                tooltip="The name of the panel"
                rules={[
                  { required: true, message: 'Please enter the panel name' },
                  { max: 150, message: 'Name cannot exceed 150 characters' },
                ]}
              >
                <Input placeholder="Enter panel name" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="slug"
                label="Slug"
                tooltip="Short identifier for the panel"
                rules={[
                  { required: true, message: 'Please enter the slug' },
                  { max: 10, message: 'Slug cannot exceed 10 characters' },
                ]}
              >
                <Input placeholder="e.g., MTLS" style={{ textTransform: 'uppercase' }} />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="panelType"
                label="Panel Type"
                tooltip="The type of analysis panel"
                rules={[{ required: true, message: 'Please select a panel type' }]}
              >
                <Select placeholder="Select panel type">
                  {selectors.panelTypes?.map(type => (
                    <Option key={type.id} value={type.label}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="panelGroupId"
                label="Panel Group"
                tooltip="The group this panel belongs to"
              >
                <Select placeholder="Select panel group" allowClear>
                  {selectors.panelGroupItems.map(group => (
                    <Option key={group.id} value={group.id}>
                      {group.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="significantDigits"
                label="Significant Digits"
                tooltip="Number of significant digits for results"
                rules={[{ required: true, message: 'Please enter significant digits' }]}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                name="decimalFormatType"
                label="Decimal Format Type"
                tooltip="Format for displaying decimal values"
                rules={[{ required: true, message: 'Please select a decimal format type' }]}
              >
                <Select placeholder="Select decimal format">
                  {selectors.decimalFormatTypes?.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="qualitativeFirst"
                label="Qualitative First"
                tooltip="Perform qualitative analysis before quantitative"
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="requiresMoistureContent"
                label="Requires Moisture"
                tooltip="Sample requires moisture content measurement"
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="allowPartialAnalytes"
                label="Allow Partial Analytes"
                tooltip="Allow submitting partial analyte results"
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="active"
                label="Active"
                tooltip="Panel is active and available for use"
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </FormItem>
            </Col>
          </Row>

          <Divider>SOPs and Methods</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="plantSop"
                label="Plant SOP"
                tooltip="SOP for plant samples"
                rules={[
                  { required: true, message: 'Please enter the plant SOP' },
                  { max: 150, message: 'SOP cannot exceed 150 characters' },
                ]}
              >
                <Input placeholder="Enter plant SOP" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="nonPlantSop"
                label="Non-Plant SOP"
                tooltip="SOP for non-plant samples"
                rules={[
                  { required: true, message: 'Please enter the non-plant SOP' },
                  { max: 150, message: 'SOP cannot exceed 150 characters' },
                ]}
              >
                <Input placeholder="Enter non-plant SOP" />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="instrumentTypeId"
                label="Instrument Type"
                tooltip="Type of instrument used for this panel"
              >
                <Select placeholder="Select instrument type" allowClear>
                  {selectors.instrumentTypes?.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="testCategoryId" label="Test Category" tooltip="Category of test">
                <Select placeholder="Select test category" allowClear>
                  {selectors.testCategoryTypes?.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
          </Row>

          <Divider>Units and Measurements</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="units"
                label="Units"
                tooltip="Standard units for this panel"
                rules={[
                  { required: true, message: 'Please enter the units' },
                  { max: 150, message: 'Units cannot exceed 150 characters' },
                ]}
              >
                <Input placeholder="e.g., mg/kg" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="measuredUnits"
                label="Measured Units"
                tooltip="Units in which measurements are taken"
              >
                <Input placeholder="e.g., mg/L" />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="limitUnits"
                label="Limit Units"
                tooltip="Units used for limit specifications"
              >
                <Input placeholder="e.g., mg/kg" />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <FormItem
                name="scaleFactor"
                label="Scale Factor"
                tooltip="Factor to scale results by"
                rules={[{ required: true, message: 'Please enter scale factor' }]}
              >
                <InputNumber step={0.1} min={0} style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="defaultExtractionVolumeMl"
                label="Default Extraction Volume (mL)"
                tooltip="Default volume for extraction in milliliters"
              >
                <InputNumber step={0.1} min={0} style={{ width: '100%' }} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                name="defaultDilution"
                label="Default Dilution"
                tooltip="Default dilution factor"
              >
                <InputNumber step={0.1} min={0} style={{ width: '100%' }} />
              </FormItem>
            </Col>
          </Row>

          <Divider>Related Panels</Divider>
          <FormItem
            name="childPanels"
            label="Child Panels"
            tooltip="Panels that are children of this panel"
          >
            <Select mode="tags" placeholder="Enter panel slugs" style={{ width: '100%' }}>
              {/* We're using fixed panel options for now */}
              <Option value="MTLS">MTLS - Metals Panel</Option>
              <Option value="HMTLS">HMTLS - Heavy Metals Panel</Option>
              <Option value="LEAD">LEAD - Lead Panel</Option>
              <Option value="PEST">PEST - Pesticides Panel</Option>
              <Option value="MICRO">MICRO - Microbial Panel</Option>
            </Select>
          </FormItem>

          <FormItem
            name="subordinateToPanelGroup"
            label="Subordinate to Panel Group"
            tooltip="Panel is subordinate to its panel group"
            valuePropName="checked"
          >
            <Switch />
          </FormItem>

          {/* Hidden fields to preserve values */}
          <FormItem name="panelId" hidden>
            <InputNumber />
          </FormItem>
          <FormItem name="sampleCount" hidden>
            <InputNumber />
          </FormItem>
          <FormItem name="ccTestPackageId" hidden>
            <InputNumber />
          </FormItem>
          <FormItem name="ccCategoryName" hidden>
            <Input />
          </FormItem>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default PanelEditDrawer;
