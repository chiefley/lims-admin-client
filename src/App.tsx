// src/App.tsx

import React from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SopMaintenancePage from './pages/admin/SopMaintenancePage';

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router>
        <Layout className="layout" style={{ minHeight: '100vh' }}>
          <Header>
            <div
              className="logo"
              style={{ float: 'left', color: 'white', fontSize: '18px', fontWeight: 'bold' }}
            >
              LIMS Admin
            </div>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">
                <Link to="/">SOP Maintenance</Link>
              </Menu.Item>
              {/* Add more menu items as needed */}
            </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
            <div
              className="site-layout-content"
              style={{ background: '#fff', padding: 24, marginTop: 16 }}
            >
              <Routes>
                <Route path="/" element={<SopMaintenancePage />} />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Laboratory Information Management System ©{new Date().getFullYear()}
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
