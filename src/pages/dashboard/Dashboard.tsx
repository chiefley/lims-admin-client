import React from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import {
  ExperimentOutlined,
  FileSearchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { stylePresets } from '../../config/theme';
import PageHeader from '../../components/common/PageHeader';
import CardSection from '../../components/common/CardSection';

const { Paragraph } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div className="page-container">
      <PageHeader title="Dashboard" subtitle="Welcome to the LIMS Admin Dashboard" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={stylePresets.contentCard}>
            <Statistic
              title="Total Samples"
              value={1536}
              prefix={<FileSearchOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={stylePresets.contentCard}>
            <Statistic
              title="Active SOPs"
              value={42}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={stylePresets.contentCard}>
            <Statistic
              title="Lab Users"
              value={28}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={stylePresets.contentCard}>
            <Statistic
              title="Completed Tests"
              value={897}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <CardSection title="Recent Activity" icon={<BellOutlined />} style={{ marginTop: 24 }}>
        <Paragraph>
          This dashboard will show system-wide statistics and recent activities.
        </Paragraph>
        <Paragraph>Navigate to specific admin pages using the sidebar menu.</Paragraph>
      </CardSection>

      <CardSection title="Quick Actions" icon={<DashboardOutlined />}>
        <Paragraph>
          From here you can configure common laboratory settings and manage SOPs.
        </Paragraph>
      </CardSection>
    </div>
  );
};

export default Dashboard;
