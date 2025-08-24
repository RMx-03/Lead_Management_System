import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001',
  withCredentials: true,
});

// Auth endpoints
export const login = (formData) => API.post('/api/auth/login', formData);
export const register = (formData) => API.post('/api/auth/register', formData);
export const getMe = () => API.get('/api/auth/me');
export const logout = () => API.post('/api/auth/logout');

// Leads endpoints
export const fetchLeads = (params) => API.get('/api/leads', { params }); // Pass page, limit, filters
export const createLead = (leadData) => API.post('/api/leads', leadData);
export const updateLead = (id, data) => API.put(`/api/leads/${id}`, data);
export const deleteLead = (id) => API.delete(`/api/leads/${id}`);
// ... other lead service functions