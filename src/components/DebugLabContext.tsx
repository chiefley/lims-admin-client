// src/components/DebugLabContext.tsx
import React from 'react';

import { Card, Descriptions, Button, Space, Typography, Alert, Tag, Divider } from 'antd';

import { useAuth } from '../features/auth/AuthContext';
import authService from '../features/auth/authService';

const { Text, Title } = Typography;

/**
 * Debug component to help troubleshoot lab context issues
 * This component shows all the auth state information and provides debug actions
 */
const DebugLabContext: React.FC = () => {
  const {
    user,
    userLabs,
    currentLab,
    currentStateId,
    isAuthenticated,
    isLoading,
    refreshUserLabs,
  } = useAuth();

  // Get raw data from localStorage for comparison
  const getRawStorageData = () => {
    return {
      token: localStorage.getItem('auth_token'),
      userInfo: localStorage.getItem('user_info'),
      userLabs: localStorage.getItem('user_labs'),
    };
  };

  const rawData = getRawStorageData();

  // Test function to manually fetch labs
  const testFetchLabs = async () => {
    try {
      console.log('🧪 Starting manual lab fetch test...');

      if (!isAuthenticated) {
        console.error('❌ User not authenticated');
        alert('User is not authenticated');
        return;
      }

      console.log('📡 Fetching labs for authenticated user');

      const labs = await authService.fetchUserLabs();
      console.log('✅ Fetched labs:', labs);

      alert(`Successfully fetched ${labs.length} labs. Check console for details.`);

      // Force refresh the context
      await refreshUserLabs();
    } catch (error: any) {
      console.error('❌ Manual lab fetch failed:', error);
      alert(`Lab fetch failed: ${error.message}`);
    }
  };

  // Test API connectivity
  const testApiConnectivity = async () => {
    try {
      console.log('🌐 Testing API connectivity...');

      // Test a simple endpoint to see if API is reachable
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:50511/api'}/health`
      );

      if (response.ok) {
        console.log('✅ API is reachable');
        alert('API connectivity test successful');
      } else {
        console.log('⚠️ API returned status:', response.status);
        alert(`API returned status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ API connectivity test failed:', error);
      alert(`API connectivity failed: ${error.message}`);
    }
  };

  // Clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_labs');
    alert('All auth data cleared. Please refresh the page.');
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🔍 Lab Context Debug Information</Title>

      <Alert
        message="Debug Mode Active"
        description="This page shows detailed authentication and lab context information to help diagnose issues."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Auth State */}
      <Card title="🔐 Authentication State" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Is Authenticated">
            <Tag color={isAuthenticated ? 'green' : 'red'}>{isAuthenticated ? 'Yes' : 'No'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Is Loading">
            <Tag color={isLoading ? 'orange' : 'green'}>{isLoading ? 'Yes' : 'No'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            <Text strong>{user?.username || 'None'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Authentication">
            <Tag color={isAuthenticated ? 'green' : 'red'}>
              {isAuthenticated ? 'Token Valid' : 'No Token'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {user?.roles && user.roles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Roles: </Text>
            {user.roles.map(role => (
              <Tag key={role} color="blue">
                {role}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Lab Context */}
      <Card title="🏢 Lab Context" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Available Labs Count">
            <Tag color={userLabs?.length > 0 ? 'green' : 'red'}>{userLabs?.length || 0}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Current Lab">
            <Text strong>{currentLab?.labName || 'None'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Current Lab ID">
            <Text code>{currentLab?.labId || 'None'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Current State ID">
            <Text code>{currentStateId || 'None'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="State Abbreviation">
            <Text>{currentLab?.stateAbbreviation || 'None'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Is Default Lab">
            <Tag color={currentLab?.isDefaultLab ? 'gold' : 'default'}>
              {currentLab?.isDefaultLab ? 'Yes' : 'No'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {userLabs && userLabs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Available Labs:</Text>
            <Divider />
            {userLabs.map(lab => (
              <div
                key={lab.labId}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                }}
              >
                <Space>
                  <Text strong>{lab.labName}</Text>
                  <Tag>ID: {lab.labId}</Tag>
                  <Tag>State: {lab.stateAbbreviation}</Tag>
                  <Tag>State ID: {lab.stateId}</Tag>
                  {lab.isDefaultLab && <Tag color="gold">DEFAULT</Tag>}
                </Space>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Raw Storage Data */}
      <Card title="💾 Raw localStorage Data" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Auth Token">
            <Text code style={{ wordBreak: 'break-all', fontSize: 12 }}>
              {rawData.token ? `${rawData.token.substring(0, 100)}...` : 'None'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="User Info JSON">
            <Text code style={{ wordBreak: 'break-all', fontSize: 12 }}>
              {rawData.userInfo || 'None'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="User Labs JSON">
            <Text code style={{ wordBreak: 'break-all', fontSize: 12 }}>
              {rawData.userLabs || 'None'}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Debug Actions */}
      <Card title="🛠️ Debug Actions">
        <Space wrap>
          <Button type="primary" onClick={testFetchLabs} disabled={!isAuthenticated}>
            🧪 Test Manual Lab Fetch
          </Button>

          <Button onClick={testApiConnectivity}>🌐 Test API Connectivity</Button>

          <Button
            onClick={() => {
              const state = {
                user,
                userLabs,
                currentLab,
                currentStateId,
                isAuthenticated,
                isLoading,
              };
              console.log('📊 Current auth context state:', state);
              alert('Current state logged to console. Check developer tools.');
            }}
          >
            📊 Log Context State
          </Button>

          <Button
            onClick={() => {
              const contextSummary = authService.getUserWithLabs();
              console.log('🔍 AuthService context summary:', contextSummary);
              alert('AuthService state logged to console. Check developer tools.');
            }}
          >
            🔍 Log AuthService State
          </Button>

          <Button
            onClick={async () => {
              try {
                await refreshUserLabs();
                alert('User labs refreshed successfully!');
              } catch (error: any) {
                alert(`Failed to refresh labs: ${error.message}`);
              }
            }}
            disabled={!user}
          >
            🔄 Force Refresh Labs
          </Button>

          <Button danger onClick={clearAuthData}>
            🗑️ Clear All Auth Data
          </Button>
        </Space>
      </Card>

      {/* Diagnostic Alerts */}
      <div style={{ marginTop: 16 }}>
        {!currentLab && userLabs.length === 0 && isAuthenticated && (
          <Alert
            message="❌ No Lab Context Available"
            description="The user is authenticated but doesn't have any labs assigned or lab fetching failed during login."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {userLabs.length > 0 && !currentLab && (
          <Alert
            message="⚠️ Labs Available But No Current Lab Set"
            description="Labs were fetched but no current lab is set. This might be a default lab selection issue."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isAuthenticated && userLabs.length === 0 && (
          <Alert
            message="⚠️ No Labs Available"
            description="The user is authenticated but no labs were fetched. This could indicate an API issue or the user has no lab assignments."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {isAuthenticated && userLabs.length > 0 && currentLab && (
          <Alert
            message="✅ Lab Context Working Correctly"
            description={`User is authenticated with access to ${userLabs.length} lab(s) and current lab is set to "${currentLab.labName}".`}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </div>

      <Divider />

      <Text type="secondary" style={{ fontSize: 12 }}>
        💡 Tip: Open browser developer tools (F12) and check the Console tab for detailed logging
        during authentication.
      </Text>
    </div>
  );
};

export default DebugLabContext;
