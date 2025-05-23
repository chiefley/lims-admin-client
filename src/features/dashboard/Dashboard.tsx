// Example: Dashboard that handles lab changes gracefully
// src/features/dashboard/Dashboard.tsx (updated)

import React, { useState, useEffect, useCallback } from 'react';

import {
  ExperimentOutlined,
  FileTextOutlined,
  TeamOutlined,
  ReloadOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { Card, Row, Col, Statistic, Button, Space, Tag, Alert } from 'antd';

import { useLabChangeRedirect } from '../../hooks/useLabChangeRedirect';
import { useAuth } from '../auth/AuthContext';
import LabContextDisplay from '../auth/LabContextDisplay';
import PageHeader from '../shared/components/PageHeader';

interface DashboardStats {
  totalCompounds: number;
  totalPanels: number;
  totalInstruments: number;
  totalUsers: number;
  recentActivity: string[];
}

const Dashboard: React.FC = () => {
  const { currentLab, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Disable redirect for dashboard - it should handle lab changes itself
  const { currentLabId, currentLabName } = useLabChangeRedirect({
    enableRedirect: false, // Dashboard handles lab changes itself
  });

  // Fetch dashboard statistics for current lab
  const fetchDashboardStats = useCallback(async () => {
    if (!currentLabId || !isAuthenticated) {
      console.log('⏸️ Skipping dashboard stats fetch - no lab context or not authenticated');
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      console.log(`📊 Fetching dashboard stats for lab ${currentLabId}`);

      // Mock API call - replace with actual service call
      // const response = await dashboardService.fetchStats(currentLabId);

      // Mock data for demonstration
      const mockStats: DashboardStats = {
        totalCompounds: Math.floor(Math.random() * 100) + 50, // Different for each lab
        totalPanels: Math.floor(Math.random() * 20) + 10,
        totalInstruments: Math.floor(Math.random() * 15) + 5,
        totalUsers: Math.floor(Math.random() * 30) + 10,
        recentActivity: [
          `Compound "CBD-A" updated for ${currentLabName}`,
          `New panel created: "Potency Panel v2"`,
          `Instrument "HPLC-001" calibrated`,
          `User "lab.tech@example.com" logged in`,
        ],
      };

      setStats(mockStats);
      setLastRefreshTime(new Date());
      console.log(`✅ Loaded dashboard stats for lab ${currentLabId}`);
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [currentLabId, currentLabName, isAuthenticated]);

  // Load data on mount and when lab changes
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardStats();
  };

  // Show welcome message if no lab context
  if (!currentLabId || !isAuthenticated) {
    return (
      <div>
        <PageHeader
          title={
            <Space>
              <DashboardOutlined />
              LIMS Dashboard
            </Space>
          }
        />
        <Alert
          message="Welcome to LIMS Admin"
          description={
            !isAuthenticated
              ? 'Please log in to access laboratory management features.'
              : 'Please ensure you have access to a laboratory to view dashboard statistics.'
          }
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <Space>
            <DashboardOutlined />
            LIMS Dashboard
            {currentLabName && <Tag color="blue">{currentLabName}</Tag>}
          </Space>
        }
        subtitle={`Laboratory management overview for ${currentLabName}`}
        extra={
          <Space>
            {lastRefreshTime && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </div>
            )}
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
          </Space>
        }
      />

      {/* Lab Context Display */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <LabContextDisplay />
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Compounds"
              value={stats?.totalCompounds || 0}
              prefix={<ExperimentOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Test Panels"
              value={stats?.totalPanels || 0}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Instruments"
              value={stats?.totalInstruments || 0}
              prefix={<ExperimentOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats?.totalUsers || 0}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Activity"
            loading={loading}
            extra={
              <Button type="link" size="small">
                View All
              </Button>
            }
          >
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {stats.recentActivity.map((activity, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    {activity}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                No recent activity to display
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block href="/admin/compound-management">
                Manage Compounds
              </Button>
              <Button block href="/admin/panel-management">
                Manage Test Panels
              </Button>
              <Button block href="/admin/instrument-management">
                Manage Instruments
              </Button>
              <Button block href="/admin/prep-batch-sop">
                Manage Prep SOPs
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
