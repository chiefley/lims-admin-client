import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { limsTheme } from './config/theme';
import './styles/global.css';

// Import layout components
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import pages
import Dashboard from './pages/dashboard/Dashboard';
import PrepBatchSopManagement from './pages/admin/PrepBatchSopManagement';
import PrepBatchSopDetail from './pages/admin/PrepBatchSopDetail';
import AnalyticalBatchSopManagement from './features/analyticalBatchSop/pages/AnalyticalBatchSopManagement';
import AnalyticalBatchSopDetail from './pages/admin/AnalyticalBatchSopDetail';
import CompoundManagement from './pages/admin/CompoundManagement';
import PanelManagement from './pages/admin/PanelManagement';
import InstrumentManagement from './pages/admin/InstrumentManagement';
import CcSampleCategoryManagement from './pages/admin/CcSampleCategoryManagement';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
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
                <Route
                  path="admin/analytical-batch-sop"
                  element={<AnalyticalBatchSopManagement />}
                />
                <Route
                  path="admin/analytical-batch-sop/:id"
                  element={<AnalyticalBatchSopDetail />}
                />

                <Route path="admin/compound-management" element={<CompoundManagement />} />
                <Route path="admin/panel-management" element={<PanelManagement />} />
                <Route path="admin/instrument-management" element={<InstrumentManagement />} />
                <Route
                  path="admin/cc-sample-category-management"
                  element={<CcSampleCategoryManagement />}
                />
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
