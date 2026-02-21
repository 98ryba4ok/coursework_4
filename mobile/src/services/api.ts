import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, NIHSSCalculation, NIHSSScores, Statistics } from '../types';

//const BASE_URL = 'https://nihss-backend.onrender.com/api';
const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string, full_name: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, full_name }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get('/auth/me'),
};

export const calculatorAPI = {
  calculate: (data: { patient_age: number; patient_notes: string } & NIHSSScores) =>
    api.post<NIHSSCalculation>('/calculations', data),

  list: (page = 1) =>
    api.get<{ results: NIHSSCalculation[]; count: number }>(`/calculations?page=${page}`),

  get: (id: string) =>
    api.get<NIHSSCalculation>(`/calculations/${id}`),

  delete: (id: string) =>
    api.delete(`/calculations/${id}`),

  statistics: () =>
    api.get<Statistics>('/calculations/statistics'),
};

export default api;
