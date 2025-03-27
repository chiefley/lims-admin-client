// src/api/config.ts
import axios from 'axios';

// Base URL from your API documentation
export const BASE_URL = 'http://localhost:50511/api';

// Default LabId from your documentation
export const DEFAULT_LAB_ID = 1001;

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    // Handle error response
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
