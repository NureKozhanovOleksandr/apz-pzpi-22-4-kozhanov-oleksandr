import axios from 'axios';

const getToken = () => {
  return localStorage.getItem('accessToken');
};

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const excludedRoutes = ['/api/auth/login', '/api/auth/register'];
    if (token && !excludedRoutes.includes(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;