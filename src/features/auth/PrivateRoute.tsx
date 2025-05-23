// src/components/PrivateRoute.tsx
import React from 'react';

import { Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext';

interface PrivateRouteProps {
  requiredRoles?: string[];
}

/**
 * Component for protecting routes that require authentication
 * If requiredRoles is provided, user must have at least one of the specified roles
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return URL - the state is causing an infinite loop
    // Because the Navigate component with this state causes location to change on every render
    return <Navigate to="/login" replace />;
  }

  // If roles are required, check if user has at least one of them
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user?.roles.includes(role));

    if (!hasRequiredRole) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required roles, render the protected route
  return <Outlet />;
};

export default PrivateRoute;
