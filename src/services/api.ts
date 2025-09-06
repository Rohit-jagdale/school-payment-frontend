import axios from 'axios';
import type { 
  TransactionResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  FilterOptions,
  SortOptions,
  PaginationOptions 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://school-payment-api-4.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<any> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const transactionService = {
  getAllTransactions: async (
    pagination: PaginationOptions,
    sort?: SortOptions,
    filters?: FilterOptions
  ): Promise<TransactionResponse> => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }

    if (filters?.schoolIds?.length) {
      filters.schoolIds.forEach(id => params.append('school_id', id));
    }

    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  getTransactionsBySchool: async (
    schoolId: string,
    pagination: PaginationOptions,
    sort?: SortOptions,
    filters?: FilterOptions
  ): Promise<TransactionResponse> => {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    });

    if (sort) {
      params.append('sortBy', sort.field);
      params.append('sortOrder', sort.direction);
    }

    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }

    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await api.get(`/transactions/school/${schoolId}?${params.toString()}`);
    return response.data;
  },

  getTransactionStatus: async (customOrderId: string): Promise<any> => {
    const response = await api.get(`/transactions/status/${customOrderId}`);
    return response.data;
  },

  createDummyData: async (): Promise<any> => {
    const response = await api.post('/transactions/dummy-data');
    return response.data;
  },
};

export const paymentService = {
  createPayment: async (paymentData: any): Promise<any> => {
    const response = await api.post('/payment/create-payment', paymentData);
    return response.data;
  },

  getPaymentStatus: async (customOrderId: string): Promise<any> => {
    const response = await api.get(`/payment/status/${customOrderId}`);
    return response.data;
  },
};

export const webhookService = {
  processWebhook: async (webhookData: any): Promise<any> => {
    const response = await api.post('/webhook', webhookData);
    return response.data;
  },
};

export default api;
