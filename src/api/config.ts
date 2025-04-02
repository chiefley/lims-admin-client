// src/api/config.ts
import axios from 'axios';
import appConfig from '../config/appConfig';

// Base URL from your API documentation
export const BASE_URL = appConfig.api.baseUrl;

// Default LabId from your documentation
export const DEFAULT_LAB_ID = appConfig.api.defaultLabId;

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent long-waiting requests
  timeout: 15000,
});

// Add a response interceptor to handle common error patterns
apiClient.interceptors.response.use(
  response => {
    // If the server returns a success: false, we can handle it here
    const data = response.data;
    if (data && data.success === false) {
      // You could throw an error here to be caught by the catch block in the service
      return Promise.reject({
        message: data.message || 'An error occurred',
        validationErrors: data.validationErrors || [],
        status: response.status,
        data: data,
      });
    }
    return response;
  },
  error => {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timed out. Please try again later.',
        status: 408,
      });
    }

    // Handle no response from server
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
      });
    }

    // Handle common HTTP status codes
    const status = error.response.status;
    let message = error.response?.data?.message || error.message || 'An unknown error occurred';

    if (status === 401) {
      message = 'Unauthorized. Please log in again.';
    } else if (status === 403) {
      message = 'You do not have permission to access this resource.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status === 500) {
      message = 'A server error occurred. Please try again later.';
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
