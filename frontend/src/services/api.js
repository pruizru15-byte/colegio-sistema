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

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token JWT en las cabeceras
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Autenticación
export const loginApi = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updatePerfilApi = async (data) => {
  const res = await api.put('/auth/perfil', data);
  return res.data;
};

export const cambiarPasswordApi = async (data) => {
  const res = await api.put('/auth/cambiar-password', data);
  return res.data;
};

// Equipos
export const getEquiposApi = async (params = {}) => {
  const res = await api.get('/equipos', { params });
  return res.data;
};

export const getEquipoByIdApi = async (id) => {
  const res = await api.get(`/equipos/${id}`);
  return res.data;
};

export const createEquipoApi = async (data) => {
  const res = await api.post('/equipos', data);
  return res.data;
};

export const updateEquipoApi = async (id, data) => {
  const res = await api.put(`/equipos/${id}`, data);
  return res.data;
};

export const deleteEquipoApi = async (id) => {
  const res = await api.delete(`/equipos/${id}`);
  return res.data;
};

// Ubicaciones
export const getUbicacionesApi = async () => {
  const res = await api.get('/ubicaciones');
  return res.data;
};

export const createUbicacionApi = async (data) => {
  const res = await api.post('/ubicaciones', data);
  return res.data;
};

// Usuarios
export const getUsuariosApi = async (params = {}) => {
  const res = await api.get('/usuarios', { params });
  return res.data;
};

export const createUsuarioApi = async (data) => {
  const res = await api.post('/usuarios', data);
  return res.data;
};

export const updateUsuarioApi = async (id, data) => {
  const res = await api.put(`/usuarios/${id}`, data);
  return res.data;
};

export const deleteUsuarioApi = async (id) => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
};

// Mantenimientos
export const getMantenimientosApi = async (params = {}) => {
  const res = await api.get('/mantenimientos', { params });
  return res.data;
};

export const getMantenimientoByIdApi = async (id) => {
  const res = await api.get(`/mantenimientos/${id}`);
  return res.data;
};

export const createMantenimientoApi = async (data) => {
  const res = await api.post('/mantenimientos', data);
  return res.data;
};

export const updateMantenimientoApi = async (id, data) => {
  const res = await api.put(`/mantenimientos/${id}`, data);
  return res.data;
};

export const deleteMantenimientoApi = async (id) => {
  const res = await api.delete(`/mantenimientos/${id}`);
  return res.data;
};

// Préstamos y Trazabilidad
export const getPrestamosApi = async (params = {}) => {
  const res = await api.get('/prestamos', { params });
  return res.data;
};

export const createPrestamoApi = async (data) => {
  const res = await api.post('/prestamos', data);
  return res.data;
};

export const devolverPrestamoApi = async (id, params = {}) => {
  const res = await api.post(`/prestamos/${id}/devolver`, null, { params });
  return res.data;
};

// Reportes Estratégicos
export const getReportesResumenApi = async () => {
  const res = await api.get('/reportes/resumen');
  return res.data;
};

export const getReporteInventarioApi = async (params = {}) => {
  const res = await api.get('/reportes/inventario', { params });
  return res.data;
};

export const getReporteMantenimientosApi = async (params = {}) => {
  const res = await api.get('/reportes/mantenimientos', { params });
  return res.data;
};

export const getReportePrestamosApi = async (params = {}) => {
  const res = await api.get('/reportes/prestamos', { params });
  return res.data;
};

export const getReporteEstadisticasApi = async () => {
  const res = await api.get('/reportes/estadisticas');
  return res.data;
};

// Códigos QR
export const getFichaQRApi = async (codigoHash) => {
  const res = await api.get(`/qr/consultar/${codigoHash}`);
  return res.data;
};

export const getQRCatalogoApi = async (params = {}) => {
  const res = await api.get('/qr/catalogo', { params });
  return res.data;
};

export const getQRStatsApi = async () => {
  const res = await api.get('/qr/stats');
  return res.data;
};

export default api;

