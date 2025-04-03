// src/api/client.ts
import axios from 'axios';
import { message } from 'antd';
import appConfig from '../config/appConfig';
import { API_TIMEOUT } from '../config/constants';

// Create an axios instance with default configuration
const baseURL = appConfig.api.baseUrl;

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Add a response interceptor to handle common error patterns
client.interceptors.response.use(
  response => {
    // If the server returns a success: false, we can handle it here
    const data = response.data;
    if (data && data.success === false) {
      // Display error message if available
      if (data.message) {
        message.error(data.message);
      }

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
      message.error('Request timed out. Please try again later.');
      return Promise.reject({
        message: 'Request timed out. Please try again later.',
        status: 408,
      });
    }

    // Handle no response from server
    if (!error.response) {
      message.error('Network error. Please check your connection and try again.');
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
      });
    }

    // Handle common HTTP status codes
    const status = error.response.status;
    let errorMessage =
      error.response?.data?.message || error.message || 'An unknown error occurred';

    if (status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to access this resource.';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (status === 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }

    message.error(errorMessage);

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default client;
