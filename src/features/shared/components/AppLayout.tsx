// src/features/shared/components/AppLayout.tsx - Enhanced with Navigation Protection
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
import { Outlet, useNavigate } from 'react-router-dom';

import { useNavigationProtection } from '../../../contexts/NavigationProtectionContext';
import { useAuth } from '../../auth/AuthContext';
import LabContextDisplay from '../../auth/LabContextDisplay';
import LabSelector from '../../auth/LabSelector';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { user, logout, currentLab, isAuthenticated } = useAuth();
  const { protectedNavigate } = useNavigationProtection();
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

  // Protected navigation handler for menu items
  const handleMenuClick = (path: string) => {
    protectedNavigate(path);
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
      onClick: () => handleMenuClick('/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Enhanced menu items with protected navigation
  interface MenuItem {
    key: string;
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
    children?: MenuItem[];
  }

  interface ChildMenuItem {
    key: string;
    label: string;
    path: string;
  }

  const createMenuItem = (
    key: string,
    icon: React.ReactNode,
    label: string,
    path?: string,
    children?: ChildMenuItem[]
  ): MenuItem => {
    if (children) {
      return {
        key,
        icon,
        label,
        children: children.map(child =>
          createMenuItem(child.key, undefined, child.label, child.path)
        ),
      };
    }

    if (path) {
      return {
        key,
        icon,
        label,
        onClick: () => handleMenuClick(path),
      };
    }

    return {
      key,
      icon,
      label,
    };
  };

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
                  createMenuItem('1', <DashboardOutlined />, 'Dashboard', '/'),
                  createMenuItem('2', <TableOutlined />, 'Basic Tables', undefined, [
                    {
                      key: '2-1',
                      label: 'Compound Management',
                      path: '/admin/compound-management',
                    },
                    {
                      key: '2-2',
                      label: 'CC Compound Management',
                      path: '/admin/cc-compound-management',
                    },
                    { key: '2-3', label: 'Panel Management', path: '/admin/panel-management' },
                    {
                      key: '2-4',
                      label: 'Panel Group Management',
                      path: '/admin/panel-group-management',
                    },
                    {
                      key: '2-5',
                      label: 'Test Category Management',
                      path: '/admin/test-category-management',
                    },
                    {
                      key: '2-6',
                      label: 'Potency Category Management',
                      path: '/admin/potency-category-management',
                    },
                    {
                      key: '2-7',
                      label: 'Item Type Management',
                      path: '/admin/item-type-management',
                    },
                    {
                      key: '2-8',
                      label: 'Needed By Management',
                      path: '/admin/needed-by-management',
                    },
                    {
                      key: '2-9',
                      label: 'Database Enum Management',
                      path: '/admin/db-enum-management',
                    },
                    {
                      key: '2-10',
                      label: 'File Parser Management',
                      path: '/admin/file-parser-management',
                    },
                    {
                      key: '2-11',
                      label: 'Navigation Menu Management',
                      path: '/admin/nav-menu-management',
                    },
                  ]),
                  createMenuItem('3', <ExperimentOutlined />, 'Lab Assets', undefined, [
                    {
                      key: '3-1',
                      label: 'Instrument Management',
                      path: '/admin/instrument-management',
                    },
                  ]),
                  createMenuItem('4', <UserOutlined />, 'Client Management', undefined, [
                    { key: '4-1', label: 'Client Management', path: '/admin/clients' },
                    {
                      key: '4-2',
                      label: 'Client License Categories',
                      path: '/admin/client-license-category',
                    },
                    {
                      key: '4-3',
                      label: 'Client License Types',
                      path: '/admin/client-license-type',
                    },
                  ]),
                  createMenuItem('5', <FileTextOutlined />, 'Batch SOPs', undefined, [
                    { key: '5-1', label: 'Prep Batch SOPs', path: '/admin/prep-batch-sop' },
                    {
                      key: '5-2',
                      label: 'Analytical Batch SOPs',
                      path: '/admin/analytical-batch-sop',
                    },
                  ]),
                  createMenuItem('6', <BugOutlined />, 'Debug', undefined, [
                    { key: '6-1', label: 'Lab Context Debug', path: '/debug/lab-context' },
                  ]),
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
