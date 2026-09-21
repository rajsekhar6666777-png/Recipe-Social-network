import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('recipe_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.user);
          }
        } catch (err) {
          console.error('Failed to fetch user profile on init:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: authToken, user: userData } = response.data;
      localStorage.setItem('recipe_token', authToken);
      localStorage.setItem('recipe_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return response.data;
    }
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      const { token: authToken, user: userData } = response.data;
      localStorage.setItem('recipe_token', authToken);
      localStorage.setItem('recipe_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('recipe_token');
    localStorage.removeItem('recipe_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('recipe_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
