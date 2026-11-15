// Copyright (c) 2026 MyCompany LLC
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('usuario_actual');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await getMeApi();
          if (userData && (userData.id || userData.email)) {
            setUser(userData);
            localStorage.setItem('usuario_actual', JSON.stringify(userData));
          }
        } catch (error) {
          console.warn("Validando sesión de usuario:", error);
          if (error?.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    const u = data.usuario || data.user;
    localStorage.setItem('token', data.access_token);
    if (u) {
      localStorage.setItem('usuario_actual', JSON.stringify(u));
    }
    setToken(data.access_token);
    setUser(u);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_actual');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    if (newUserData) {
      localStorage.setItem('usuario_actual', JSON.stringify(newUserData));
    }
  };

  const isAdmin = user?.rol?.toLowerCase() === 'administrador';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      login: async () => {},
      logout: () => {},
      updateUser: () => {},
      isAdmin: false
    };
  }
  return context;
};

