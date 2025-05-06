import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Tabs, message, Spin, Row, Col, Card } from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  CcSampleCategoryRs,
  CcSampleTypeRs,
  ConfigurationMaintenanceSelectors,
} from '../../models/types';
import CardSection from '../common/CardSection';
import FormItem from '../common/FormItem';
import { stylePresets } from '../../config/theme';
import SampleTypesTab from './SampleTypesTab';

const { TabPane } = Tabs;
const { Option } = Select;

interface CcSampleCategoryDetailProps {
  category: CcSampleCategoryRs;
  selectors: ConfigurationMaintenanceSelectors;
  onUpdate: (category: CcSampleCategoryRs) => void;
  onBack: () => void;
  saving?: boolean;
}

const CcSampleCategoryDetail: React.FC<CcSampleCategoryDetailProps> = ({
  category,
  selectors,
  onUpdate,
  onBack,
  saving = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [editing, setEditing] = useState(category.ccSampleCategoryId < 0); // Auto-edit for new records
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CcSampleCategoryRs>(category);

  // Set form values when category changes
  useEffect(() => {
    form.setFieldsValue(category);
    setCurrentCategory(category);
    // Auto enter edit mode for new records
    setEditing(category.ccSampleCategoryId < 0);
  }, [form, category]);

  // Handle form submission
  const handleSave = async () => {
    try {
      // Validate form
      const values = await form.validateFields();

      // Create updated category object
      const updatedCategory: CcSampleCategoryRs = {
        ...currentCategory,
        ...values,
      };

      // Call parent update handler
      onUpdate(updatedCategory);
      setCurrentCategory(updatedCategory);
      setEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please check the form for errors');
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    form.setFieldsValue(currentCategory);
    setEditing(false);
  };

  // Handle changes to sample types
  const handleSampleTypesChange = (sampleTypes: CcSampleTypeRs[]) => {
    setCurrentCategory({
      ...currentCategory,
      ccSampleTypeRss: sampleTypes,
    });

    // Call the update handler with the updated category
    onUpdate({
      ...currentCategory,
      ccSampleTypeRss: sampleTypes,
    });
  };

  return (
    <Spin spinning={loading}>
      <div className="cc-sample-category-detail">
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
              Back to Categories List
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

        <Form form={form} layout="vertical" initialValues={currentCategory} disabled={!editing}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Basic Information" key="basic">
              <CardSection title="Category Details" style={stylePresets.contentCard}>
                <Row gutter={24}>
                  <Col span={16}>
                    <FormItem
                      name="name"
                      label="Name"
                      tooltip="The name of the sample category"
                      rules={[
                        { required: true, message: 'Please enter the category name' },
                        { max: 150, message: 'Name cannot exceed 150 characters' },
                      ]}
                    >
                      <Input placeholder="Enter category name" />
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      name="defaultCcSampleProductionMethodId"
                      label="Default Production Method"
                      tooltip="The default method used for producing samples in this category"
                    >
                      <Select placeholder="Select production method" allowClear>
                        {selectors.dbEnumTypes
                          ?.filter(item => item.label.includes('Production'))
                          .map(item => (
                            <Option key={item.id} value={item.id}>
                              {item.label}
                            </Option>
                          ))}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>

                {/* Hidden field for ID */}
                <Form.Item name="ccSampleCategoryId" hidden>
                  <Input type="hidden" />
                </Form.Item>
              </CardSection>
            </TabPane>

            <TabPane tab="Sample Types" key="sampleTypes">
              <CardSection title="Sample Types">
                <SampleTypesTab
                  sampleTypes={currentCategory.ccSampleTypeRss || []}
                  categoryId={currentCategory.ccSampleCategoryId}
                  onChange={handleSampleTypesChange}
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

export default CcSampleCategoryDetail;
