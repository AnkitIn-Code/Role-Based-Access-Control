import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      setUser(response.data.user);
      // Store token in localStorage as backup
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      setUser(response.data.user);
      // Store token in localStorage as backup
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  // Request editor access (Viewer only)
  const requestEditor = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/request-editor');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Request failed' };
    }
  };

  // Admin: fetch pending editor requests
  const fetchEditorRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/editor-requests');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to fetch requests' };
    }
  };

  const approveEditorRequest = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/users/editor-requests/${userId}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Approve failed' };
    }
  };

  const rejectEditorRequest = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/users/editor-requests/${userId}/reject`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Reject failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    requestEditor,
    fetchEditorRequests,
    approveEditorRequest,
    rejectEditorRequest,
    logout,
    checkAuth,
    isAdmin: user?.role === 'Admin',
    isEditor: user?.role === 'Editor',
    isViewer: user?.role === 'Viewer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

