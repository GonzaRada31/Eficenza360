import axios from 'axios';

// Get base URL from environment or default to local API
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach tokens and tenantId
apiClient.interceptors.request.use(
  (config) => {
    // 1. Attach JWT Token
    const token = localStorage.getItem('eficenza_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach Tenant ID Header based on Context/URL or Storage
    const tenantId = localStorage.getItem('eficenza_tenant_id');
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access globally (e.g., redirect to login)
      localStorage.removeItem('eficenza_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
