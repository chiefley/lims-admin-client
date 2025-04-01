import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp, message } from 'antd';
import { limsTheme } from './config/theme';
import './styles/global.css';

// Import layout components
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import pages
import Dashboard from './pages/dashboard/Dashboard';
import PrepBatchSopManagement from './pages/admin/PrepBatchSopManagement';
import PrepBatchSopDetail from './pages/admin/PrepBatchSopDetail';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  // Configure global message settings
  message.config({
    top: 60,
    duration: 3,
    maxCount: 3,
  });

  return (
    <ConfigProvider theme={limsTheme}>
      <AntApp>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="admin/prep-batch-sop" element={<PrepBatchSopManagement />} />
                <Route path="admin/prep-batch-sop/:id" element={<PrepBatchSopDetail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
