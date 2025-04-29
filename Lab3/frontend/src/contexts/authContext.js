import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../configs/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/profile');
        if (response.status === 200) {
          setIsAuthenticated(true);
          setUserData(response.data.user);
        }
      } catch (error) {
        console.error("Authentication check failed:", error.message);
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
    navigate('/customers');
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Logout failed:", error.message);
    } finally {
      setIsAuthenticated(false);
      setUserData(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};