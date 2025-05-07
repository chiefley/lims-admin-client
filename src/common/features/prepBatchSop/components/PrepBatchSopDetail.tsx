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
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ExperimentOutlined,
  EditOutlined,
  FileTextOutlined,
  CloseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
// UPDATED: Import the service as a default import
import sopService from '../../api/endpoints/configurationService';
import { SopFieldRs, ManifestSamplePrepBatchSopRs, SopProcedureRs } from '../../models/types';
import PageHeader from '../../components/common/PageHeader';

// Import the tab components
// Import all tab components from the index file
import {
  BasicInfoTab,
  SampleConfigurationsTab,
  SopProceduresTab,
  SopFieldsTab,
} from '../../components/tabs';

// Define the component
const PrepBatchSopDetail: React.FC = () => {
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

        // UPDATED: Use the functions from the service object
        // Fetch both the SOP details and selectors in parallel
        const [sopData, selectorsData] = await Promise.all([
          sopService.fetchPrepBatchSopDetail(Number(id)),
          sopService.fetchSelectors(),
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

      // UPDATED: Use the function from the service object
      // Call the service to save the data
      await sopService.savePrepBatchSop(dataToSave);

      // Update local state with the saved data
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

  // Handle sample configuration changes
  const handleSampleConfigChange = (samples: ManifestSamplePrepBatchSopRs[]) => {
    setSopData({
      ...sopData,
      manifestSamplePrepBatchSopRss: samples,
    });
  };

  // Handle procedures changes
  const handleProceduresChange = (procedures: SopProcedureRs[]) => {
    setSopData({
      ...sopData,
      sopProcedures: procedures,
    });
  };

  // Handle fields changes (if editing is implemented in the future)
  const handleFieldsChange = (fields: SopFieldRs[]) => {
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
            <BasicInfoTab
              sopData={sopData}
              editing={editing}
              selectors={selectors}
              form={form}
              onDataChange={(field, value) => {
                setSopData((prev: typeof sopData) => ({
                  ...prev,
                  [field]: value,
                }));
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ExperimentOutlined /> Sample Configurations
              </span>
            }
            key="samples"
          >
            <SampleConfigurationsTab
              sopData={sopData}
              selectors={selectors}
              editing={editing}
              onSampleConfigChange={handleSampleConfigChange}
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
                <FileTextOutlined /> SOP Fields
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

export default PrepBatchSopDetail;
