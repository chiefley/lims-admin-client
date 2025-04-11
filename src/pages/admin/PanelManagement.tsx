import React, { useState, useEffect } from 'react';
import { Typography, Spin, Table, Tag, Button, Tooltip, message, Space, Input, Tabs } from 'antd';
import { SearchOutlined, ExperimentOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';
import configurationService from '../../api/endpoints/configurationService';
import { PanelRs, ConfigurationMaintenanceSelectors } from '../../models/types';
import PanelEditDrawer from '../../components/panels/PanelEditDrawer';

const { Text } = Typography;
const { TabPane } = Tabs;

const PanelManagement: React.FC = () => {
  const [panels, setPanels] = useState<PanelRs[]>([]);
  const [selectors, setSelectors] = useState<ConfigurationMaintenanceSelectors | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPanels, setFilteredPanels] = useState<PanelRs[]>([]);
  const [editingPanel, setEditingPanel] = useState<PanelRs | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');

  // Load panels and selectors
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch panels and selectors in parallel
        const [panelsData, selectorsData] = await Promise.all([
          configurationService.fetchPanels(),
          configurationService.fetchSelectors(),
        ]);

        setPanels(panelsData);
        setSelectors(selectorsData);
        setFilteredPanels(panelsData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        message.error('Failed to load panels');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter panels based on search text and active tab
  useEffect(() => {
    if (!panels.length) return;

    let filtered = [...panels];

    // Apply search filter if search text exists
    if (searchText) {
      filtered = filtered.filter(
        panel =>
          panel.name.toLowerCase().includes(searchText.toLowerCase()) ||
          panel.slug.toLowerCase().includes(searchText.toLowerCase()) ||
          (panel.ccCategoryName &&
            panel.ccCategoryName.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Apply tab filter if not on "all" tab
    if (activeTabKey !== 'all') {
      filtered = filtered.filter(panel => {
        switch (activeTabKey) {
          case 'quantitative':
            return panel.panelType === 'Quantitative';
          case 'qualitative':
            return panel.panelType === 'Qualitative';
          case 'metals':
            return panel.panelGroupId === 1; // Metals panel group
          case 'pesticides':
            return panel.panelGroupId === 2; // Pesticides panel group
          default:
            return true;
        }
      });
    }

    setFilteredPanels(filtered);
  }, [searchText, panels, activeTabKey]);

  // Handle adding a new panel
  const handleAddPanel = () => {
    // Create a new panel with default values
    const newPanel: PanelRs = {
      panelId: -Date.now(), // Temporary negative ID
      name: 'New Panel',
      slug: '',
      subordinateToPanelGroup: false,
      panelGroupId: null,
      significantDigits: 2,
      decimalFormatType: null,
      panelType: 'Quantitative',
      qualitativeFirst: false,
      requiresMoistureContent: false,
      allowPartialAnalytes: false,
      plantSop: '',
      nonPlantSop: '',
      scaleFactor: 1.0,
      units: '',
      measuredUnits: '',
      limitUnits: '',
      defaultExtractionVolumeMl: null,
      defaultDilution: null,
      instrumentTypeId: null,
      ccTestPackageId: null,
      ccCategoryName: '',
      testCategoryId: null,
      sampleCount: 0,
      childPanels: [],
    };

    // Add to the array
    setPanels([newPanel, ...panels]);
    setFilteredPanels([newPanel, ...filteredPanels]);

    // Open the edit drawer for the new panel
    setEditingPanel(newPanel);
    setDrawerVisible(true);
  };

  // Handle editing a panel
  const handleEditPanel = (panel: PanelRs) => {
    setEditingPanel(panel);
    setDrawerVisible(true);
  };

  // Handle saving a panel after editing
  const handleSavePanel = async (updatedPanel: PanelRs) => {
    try {
      // Calling the service function to save the panel
      await configurationService.savePanel(updatedPanel);

      setPanels(prevPanels =>
        prevPanels.map(p => (p.panelId === updatedPanel.panelId ? updatedPanel : p))
      );

      // Update filtered panels too
      setFilteredPanels(prevFiltered =>
        prevFiltered.map(p => (p.panelId === updatedPanel.panelId ? updatedPanel : p))
      );

      setDrawerVisible(false);
      setEditingPanel(null);
      message.success(`Panel ${updatedPanel.name} updated successfully`);
    } catch (error) {
      message.error('Failed to save panel');
      console.error('Error saving panel:', error);
    }
  };

  // Table columns definition
  const columns: ColumnsType<PanelRs> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => <Text strong>{text}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 100,
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'panelType',
      key: 'panelType',
      width: 120,
      render: text => <Tag color={text === 'Quantitative' ? 'green' : 'orange'}>{text}</Tag>,
      filters: [
        { text: 'Quantitative', value: 'Quantitative' },
        { text: 'Qualitative', value: 'Qualitative' },
      ],
      onFilter: (value, record) => record.panelType === value,
    },
    {
      title: 'Panel Group',
      dataIndex: 'panelGroupId',
      key: 'panelGroupId',
      render: (id, record) => {
        if (!id || !selectors) return 'Not Assigned';
        const groupItem = selectors.panelGroupItems.find(item => item.id === id);
        return groupItem ? groupItem.label : `ID: ${id}`;
      },
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      width: 100,
    },
    {
      title: 'Sample Count',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 120,
      sorter: (a, b) => a.sampleCount - b.sampleCount,
      render: count => <Tag color={count > 0 ? 'volcano' : 'default'}>{count}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Panel">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEditPanel(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expandable row configuration to show more panel details
  const expandedRowRender = (record: PanelRs) => {
    return (
      <div style={{ padding: '0 20px' }}>
        <Tabs defaultActiveKey="basic">
          <TabPane tab="Basic Information" key="basic">
            <div className="panel-details">
              <Space size={[32, 16]} wrap>
                <div>
                  <Text type="secondary">Significant Digits:</Text> {record.significantDigits}
                </div>
                <div>
                  <Text type="secondary">Format Type:</Text>{' '}
                  {selectors?.decimalFormatTypes.find(t => t.id === record.decimalFormatType)
                    ?.label || record.decimalFormatType}
                </div>
                <div>
                  <Text type="secondary">Scale Factor:</Text> {record.scaleFactor}
                </div>
                <div>
                  <Text type="secondary">Requires Moisture:</Text>{' '}
                  {record.requiresMoistureContent ? 'Yes' : 'No'}
                </div>
                <div>
                  <Text type="secondary">Allow Partial Analytes:</Text>{' '}
                  {record.allowPartialAnalytes ? 'Yes' : 'No'}
                </div>
                <div>
                  <Text type="secondary">Qualitative First:</Text>{' '}
                  {record.qualitativeFirst ? 'Yes' : 'No'}
                </div>
              </Space>
            </div>
          </TabPane>
          <TabPane tab="SOPs" key="sops">
            <div className="panel-details">
              <Space size={[32, 16]} wrap>
                <div>
                  <Text type="secondary">Plant SOP:</Text> {record.plantSop}
                </div>
                <div>
                  <Text type="secondary">Non-Plant SOP:</Text> {record.nonPlantSop}
                </div>
              </Space>
            </div>
          </TabPane>
          <TabPane tab="Units & Measurements" key="units">
            <div className="panel-details">
              <Space size={[32, 16]} wrap>
                <div>
                  <Text type="secondary">Units:</Text> {record.units}
                </div>
                <div>
                  <Text type="secondary">Measured Units:</Text> {record.measuredUnits}
                </div>
                <div>
                  <Text type="secondary">Limit Units:</Text> {record.limitUnits}
                </div>
                <div>
                  <Text type="secondary">Default Extraction Volume:</Text>{' '}
                  {record.defaultExtractionVolumeMl} mL
                </div>
                <div>
                  <Text type="secondary">Default Dilution:</Text> {record.defaultDilution}x
                </div>
              </Space>
            </div>
          </TabPane>
          <TabPane tab="Child Panels" key="children">
            <div className="panel-details">
              {record.childPanels && record.childPanels.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {record.childPanels.map(slug => (
                    <Tag color="purple" key={slug}>
                      {slug}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">No child panels associated</Text>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Panel Management"
        subtitle="Manage analysis panels and their configurations"
      />

      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <CardSection
          title="Panels"
          icon={<ExperimentOutlined />}
          extra={
            <Space>
              <Input
                placeholder="Search panels"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPanel}>
                Add Panel
              </Button>
            </Space>
          }
        >
          <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
            <TabPane tab="All Panels" key="all" />
            <TabPane tab="Quantitative" key="quantitative" />
            <TabPane tab="Qualitative" key="qualitative" />
            <TabPane tab="Metals" key="metals" />
            <TabPane tab="Pesticides" key="pesticides" />
          </Tabs>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredPanels}
              rowKey="panelId"
              expandable={{
                expandedRowRender,
                expandRowByClick: true,
              }}
              size="middle"
              pagination={{ pageSize: 10 }}
            />
          </Spin>
        </CardSection>
      </Space>

      {/* Drawer for editing panels */}
      {selectors && (
        <PanelEditDrawer
          visible={drawerVisible}
          panel={editingPanel}
          selectors={selectors}
          onClose={() => setDrawerVisible(false)}
          onSave={handleSavePanel}
        />
      )}
    </div>
  );
};

export default PanelManagement;
