// src/App.tsx
import React, { useEffect } from 'react';

import { ConfigProvider, App as AntApp } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import authentication components
import authService from '../src/features/auth/authService';
import PrivateRoute from '../src/features/auth/PrivateRoute';

// Import layout components
import DebugLabContext from './components/DebugLabContext';
import { limsTheme } from './config/theme';
import './styles/global.css';
import AnalyticalBatchSopDetail from './features/analyticalBatchSop/AnalyticalBatchSopDetail';
import AnalyticalBatchSopManagement from './features/analyticalBatchSop/AnalyticalBatchSopManagement';
import { AuthProvider } from './features/auth/AuthContext';
import Login from './features/auth/Login';
import Unauthorized from './features/auth/Unauthorized';
import CcCompoundManagement from './features/basicTables/CcCompoundManagement';
import CompoundManagement from './features/basicTables/CompoundManagement';
import DBEnumManagement from './features/basicTables/DBEnumManagement';
import FileParserManagement from './features/basicTables/FileParserManagement';
import ItemTypeManagement from './features/basicTables/ItemTypeManagement';
import NavMenuItemManagement from './features/basicTables/NavMenuItemManagement';
import NeededByManagement from './features/basicTables/NeededByManagement';
import PanelGroupManagement from './features/basicTables/PanelGroupManagement';
import PanelManagement from './features/basicTables/PanelManagement';
import PotencyCategoryManagement from './features/basicTables/PotencyCategoryManagement';
import TestCategoryManagement from './features/basicTables/TestCategoryManagement';
import ClientLicenseCategoryManagement from './features/clients/ClientLicenseCategoryManagement';
import ClientLicenseTypeManagement from './features/clients/ClientLicenseTypeManagement';
import ClientManagement from './features/clients/ClientManagement';
import Dashboard from './features/dashboard/Dashboard';
import InstrumentManagement from './features/labAssets/InstrumentManagement';
import PrepBatchSopDetail from './features/prepBatchSop/PrepBatchSopDetail';
import PrepBatchSopManagement from './features/prepBatchSop/PrepBatchSopManagement';
import AppLayout from './features/shared/components/AppLayout';
import ErrorBoundary from './features/shared/components/ErrorBoundary';
import NotFound from './features/shared/pages/NotFound';

const App: React.FC = () => {
  // Initialize authentication when the app loads
  useEffect(() => {
    authService.initializeAuth();
  }, []);

  return (
    <ConfigProvider theme={limsTheme}>
      <AuthProvider>
        <AntApp>
          <ErrorBoundary>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes - all routes that require authentication */}
                <Route element={<PrivateRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />

                    {/* Admin routes - required admin role */}
                    <Route element={<PrivateRoute requiredRoles={['Admin']} />}>
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
                      <Route
                        path="admin/cc-compound-management"
                        element={<CcCompoundManagement />}
                      />
                      <Route path="admin/db-enum-management" element={<DBEnumManagement />} />
                      <Route
                        path="admin/file-parser-management"
                        element={<FileParserManagement />}
                      />
                      <Route path="admin/nav-menu-management" element={<NavMenuItemManagement />} />
                      <Route path="admin/panel-management" element={<PanelManagement />} />
                      <Route path="admin/item-type-management" element={<ItemTypeManagement />} />
                      <Route
                        path="admin/instrument-management"
                        element={<InstrumentManagement />}
                      />
                      <Route path="admin/needed-by-management" element={<NeededByManagement />} />
                      <Route
                        path="admin/panel-group-management"
                        element={<PanelGroupManagement />}
                      />
                      <Route
                        path="admin/test-category-management"
                        element={<TestCategoryManagement />}
                      />
                      <Route path="admin/clients" element={<ClientManagement />} />
                      <Route
                        path="admin/client-license-category"
                        element={<ClientLicenseCategoryManagement />}
                      />
                      <Route
                        path="admin/client-license-type"
                        element={<ClientLicenseTypeManagement />}
                      />
                      <Route
                        path="admin/potency-category-management"
                        element={<PotencyCategoryManagement />}
                      />
                      <Route path="debug/lab-context" element={<DebugLabContext />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>

                {/* Default route - redirect to login */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </AntApp>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
