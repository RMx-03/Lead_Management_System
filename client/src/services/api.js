import axios from 'axios';

const API = axios.create({
  baseURL: 'YOUR_DEPLOYED_BACKEND_URL', // Use env variable here
  withCredentials: true, // IMPORTANT: This tells axios to send cookies with requests
});

// Auth endpoints
export const login = (formData) => API.post('/api/auth/login', formData);
export const register = (formData) => API.post('/api/auth/register', formData);

// Leads endpoints
export const fetchLeads = (params) => API.get('/api/leads', { params }); // Pass page, limit, filters
export const createLead = (leadData) => API.post('/api/leads', leadData);
// ... other lead service functions