// src/api/client.ts
import axios from 'axios';

import appConfig from '../config/appConfig';
import { API_TIMEOUT } from '../config/constants';

// Create an axios instance with default configuration - updated baseURL
const baseURL = appConfig.api.baseUrl; // This points to 'http://localhost:50511/api'

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Response interceptor remains the same
// ...

export default client;
