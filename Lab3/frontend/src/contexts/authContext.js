import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../configs/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const response = await api.get('/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
          setUserData(response.data.data);
          if (location.pathname === '/') {
            navigate('/vets');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error.message);
        setIsAuthenticated(false);
        setUserData(null);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, navigate, location.pathname]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};