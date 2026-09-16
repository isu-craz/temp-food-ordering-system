import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const defaultDemoUser = {
        userId: 3,
        fullName: 'Kasun Perera',
        email: 'manager.colombo@spiceavenue.com',
        role: 'BRANCH_MANAGER',
        token: 'mock-jwt-colombo-manager-token',
        branchId: 1,
      };
      setUser(defaultDemoUser);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    if (response.success && response.data) {
      const authData = response.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    if (response.success && response.data) {
      const authData = response.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      return authData;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
