// src/features/shared/components/AppLayout.tsx - Enhanced with Complete Menu Structure
import React, { useState } from 'react';

import {
  DashboardOutlined,
  ExperimentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Typography, theme, Dropdown, Button, Avatar, Space, Modal } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';
import LabContextDisplay from '../../auth/LabContextDisplay';
import LabSelector from '../../auth/LabSelector';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { user, logout, currentLab, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      onOk: () => {
        logout();
        navigate('/login');
      },
      okText: 'Logout',
      cancelText: 'Cancel',
    });
  };

  // User dropdown menu items
  const userMenuItems = [
    {
      key: 'context',
      label: (
        <LabContextDisplay
          compact
          showUserInfo={false}
          style={{ border: 'none', boxShadow: 'none' }}
        />
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 16px',
          }}
        >
          <ExperimentOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          {!collapsed && (
            <Title level={4} style={{ margin: '0 0 0 12px', color: 'white' }}>
              LIMS Admin
            </Title>
          )}
        </div>

        {/* Lab Context in Sidebar */}
        {!collapsed && currentLab && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #303030' }}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px' }}>Current Lab:</Text>
            <div>
              <Text style={{ color: 'white', fontWeight: 500 }}>{currentLab.labName}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 8 }}>
                ({currentLab.stateAbbreviation})
              </Text>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={
            !isAuthenticated || !user
              ? [
                  {
                    key: 'login-required',
                    icon: <UserOutlined />,
                    label: 'Please log in to access menu items',
                    disabled: true,
                  },
                ]
              : [
                  {
                    key: '1',
                    icon: <DashboardOutlined />,
                    label: <Link to="/">Dashboard</Link>,
                  },
                  {
                    key: '2',
                    icon: <TableOutlined />,
                    label: 'Basic Tables',
                    children: [
                      {
                        key: '2-1',
                        label: <Link to="/admin/compound-management">Compound Management</Link>,
                      },
                      {
                        key: '2-2',
                        label: (
                          <Link to="/admin/cc-compound-management">CC Compound Management</Link>
                        ),
                      },
                      {
                        key: '2-3',
                        label: <Link to="/admin/panel-management">Panel Management</Link>,
                      },
                      {
                        key: '2-4',
                        label: (
                          <Link to="/admin/panel-group-management">Panel Group Management</Link>
                        ),
                      },
                      {
                        key: '2-5',
                        label: (
                          <Link to="/admin/test-category-management">Test Category Management</Link>
                        ),
                      },
                      {
                        key: '2-6',
                        label: (
                          <Link to="/admin/potency-category-management">
                            Potency Category Management
                          </Link>
                        ),
                      },
                      {
                        key: '2-7',
                        label: <Link to="/admin/item-type-management">Item Type Management</Link>,
                      },
                      {
                        key: '2-8',
                        label: <Link to="/admin/needed-by-management">Needed By Management</Link>,
                      },
                      {
                        key: '2-9',
                        label: <Link to="/admin/db-enum-management">Database Enum Management</Link>,
                      },
                      {
                        key: '2-10',
                        label: (
                          <Link to="/admin/file-parser-management">File Parser Management</Link>
                        ),
                      },
                      {
                        key: '2-11',
                        label: (
                          <Link to="/admin/nav-menu-management">Navigation Menu Management</Link>
                        ),
                      },
                    ],
                  },
                  {
                    key: '3',
                    icon: <ExperimentOutlined />,
                    label: 'Lab Assets',
                    children: [
                      {
                        key: '3-1',
                        label: <Link to="/admin/instrument-management">Instrument Management</Link>,
                      },
                    ],
                  },
                  {
                    key: '4',
                    icon: <UserOutlined />,
                    label: 'Client Management',
                    children: [
                      {
                        key: '4-1',
                        label: <Link to="/admin/clients">Client Management</Link>,
                      },
                      {
                        key: '4-2',
                        label: (
                          <Link to="/admin/client-license-category">Client License Categories</Link>
                        ),
                      },
                      {
                        key: '4-3',
                        label: <Link to="/admin/client-license-type">Client License Types</Link>,
                      },
                    ],
                  },
                  {
                    key: '5',
                    icon: <FileTextOutlined />,
                    label: 'Batch SOPs',
                    children: [
                      {
                        key: '5-1',
                        label: <Link to="/admin/prep-batch-sop">Prep Batch SOPs</Link>,
                      },
                      {
                        key: '5-2',
                        label: <Link to="/admin/analytical-batch-sop">Analytical Batch SOPs</Link>,
                      },
                    ],
                  },
                  {
                    key: '6',
                    icon: <BugOutlined />,
                    label: 'Debug',
                    children: [
                      {
                        key: '6-1',
                        label: <Link to="/debug/lab-context">Lab Context Debug</Link>,
                      },
                    ],
                  },
                ]
          }
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: token.colorBgContainer,
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            display: 'flex',
            alignItems: 'center',
            height: 64,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              style: { fontSize: 18, cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <div style={{ marginLeft: 24 }}>
              <Title level={4} style={{ margin: 0 }}>
                Laboratory Information Management System
              </Title>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Lab Selector in Header - only show when authenticated */}
            {isAuthenticated && <LabSelector size="small" showRefreshButton={false} />}

            {/* User profile dropdown - only show when authenticated */}
            {isAuthenticated && (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    {user && <Text>{user.username}</Text>}
                  </Space>
                </Button>
              </Dropdown>
            )}

            {/* Login button when not authenticated */}
            {!isAuthenticated && (
              <Button type="primary" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
