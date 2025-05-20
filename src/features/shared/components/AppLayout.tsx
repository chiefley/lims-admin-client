import React, { useState } from 'react';

import {
  DashboardOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  ToolOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Typography, theme, Dropdown, Button, Avatar, Space, Modal } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
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

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
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
                  label: <Link to="/admin/cc-compound-management">CC Compound Management</Link>,
                },
                {
                  key: '2-3',
                  label: <Link to="/admin/db-enum-management">DB Enum Management</Link>,
                },
                {
                  key: '2-4',
                  label: <Link to="/admin/file-parser-management">File Parser Management</Link>,
                },
                {
                  key: '2-5',
                  label: <Link to="/admin/panel-management">Panel Management</Link>,
                },
                {
                  key: '2-6',
                  label: <Link to="/admin/panel-group-management">Panel Group Management</Link>,
                },
                {
                  key: '2-7',
                  label: <Link to="/admin/item-type-management">Item Type Management</Link>,
                },
                {
                  key: '2-8',
                  label: <Link to="/admin/nav-menu-management">Navigation Menu Management</Link>,
                },
                {
                  key: '2-9',
                  label: <Link to="/admin/needed-by-management">Needed By Management</Link>,
                },
                {
                  key: '2-10',
                  label: (
                    <Link to="/admin/potency-category-management">Potency Category Management</Link>
                  ),
                },
                {
                  key: '2-11',
                  label: <Link to="/admin/test-category-management">Test Category Management</Link>,
                },
              ],
            },
            {
              key: '3',
              icon: <ToolOutlined />,
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
              icon: <FileTextOutlined />,
              label: <Link to="/admin/prep-batch-sop">Prep Batch SOPs</Link>,
            },
            {
              key: '5',
              icon: <FileTextOutlined />,
              label: <Link to="/admin/analytical-batch-sop">Analytical Batch SOPs</Link>,
            },
            {
              key: '6',
              icon: <TeamOutlined />,
              label: 'Clients',
              children: [
                {
                  key: '6-1',
                  label: <Link to="/admin/client-license-category">License Categories</Link>,
                },
                {
                  key: '6-2',
                  label: <Link to="/admin/client-license-type">License Types</Link>,
                },
                {
                  key: '6-3',
                  label: <Link to="/admin/clients">Client Management</Link>,
                },
              ],
            },
          ]}
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
            justifyContent: 'space-between', // Add this to push items to both sides
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

          {/* User profile dropdown */}
          <div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {user && <Text>{user.username}</Text>}
                </Space>
              </Button>
            </Dropdown>
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
