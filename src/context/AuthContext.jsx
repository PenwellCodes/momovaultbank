import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        // Verify token with backend using your auth route
        const response = await axiosInstance.get('/auth/check-auth');
        if (response.data.success) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Make sure userId is stored
          if (parsedUser._id) {
            localStorage.setItem('userId', parsedUser._id);
          }
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userEmail, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        userEmail,
        password
      });

      if (response.data.success) {
        const { accessToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData._id);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Make sure to include phoneNumber in registration
      const response = await axiosInstance.post('/auth/register', {
        userName: userData.userName,
        userEmail: userData.userEmail,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        role: userData.role || 'user'
      });
      
      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};