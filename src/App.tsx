import React from 'react';

import { ConfigProvider, App as AntApp } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import layout components
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import { limsTheme } from './config/theme';
import './styles/global.css';
import CompoundManagement from './features/basicTables/CompoundManagement';
import PanelManagement from './features/basicTables/PanelManagement';
import InstrumentManagement from './features/labAssets/InstrumentManagement';
import PrepBatchSopDetail from './features/prepBatchSop/PrepBatchSopDetail';
import PrepBatchSopManagement from './features/prepBatchSop/PrepBatchSopManagement';
import AnalyticalBatchSopDetail from './features/analyticalBatchSop/AnalyticalBatchSopDetail';
import AnalyticalBatchSopManagement from './features/analyticalBatchSop/AnalyticalBatchSopManagement';
import Dashboard from './pages/dashboard/Dashboard';
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
