// src/api/client.ts
import axios from 'axios';

import appConfig from '../config/appConfig';
import { API_TIMEOUT, ERROR_MESSAGES } from '../config/constants';

// Create an axios instance with default configuration - updated baseURL
const baseURL = appConfig.api.baseUrl; // This points to 'http://localhost:50511/api'

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Response interceptor for handling errors consistently
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear any saved authentication data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');

      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle other common errors
    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

    if (error.response) {
      // The request was made and the server responded with a status code
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          break;
        case 403:
          errorMessage = ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          errorMessage = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
      } else {
        errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      }
    }

    // Attach a user-friendly error message
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
