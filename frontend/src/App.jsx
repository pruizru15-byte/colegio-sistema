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

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Inventario } from './pages/Inventario';
import { NuevoEquipo } from './pages/NuevoEquipo';
import { Usuarios } from './pages/Usuarios';
import { Perfil } from './pages/Perfil';
import { Mantenimientos } from './pages/Mantenimientos';
import { Ubicaciones } from './pages/Ubicaciones';
import { Reportes } from './pages/Reportes';
import { FichaPublicaQR } from './pages/FichaPublicaQR';
import { EscanerQR } from './pages/EscanerQR';
import { Notificaciones } from './pages/Notificaciones';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500 text-xs">Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500 text-xs">Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const isAuthPage = location.pathname === '/login';
  const isPublicFicha = location.pathname.startsWith('/ficha/');

  if (isAuthPage || isPublicFicha) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Barra Lateral Plegable / Desplegable con Submódulos */}
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      {/* Área Principal (Cabecera Superior + Contenido) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopHeader toggleSidebar={toggleSidebar} isSidebarCollapsed={collapsed} />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-400 bg-white">
          Sistema de Inventario Tecnológico con Códigos QR • Institución Educativa UCV
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventario"
                element={
                  <ProtectedRoute>
                    <Inventario />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mantenimientos"
                element={
                  <ProtectedRoute>
                    <Mantenimientos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ubicaciones"
                element={
                  <ProtectedRoute>
                    <Ubicaciones />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reportes"
                element={
                  <ProtectedRoute>
                    <Reportes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <AdminRoute>
                    <Usuarios />
                  </AdminRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipos/nuevo"
                element={
                  <AdminRoute>
                    <NuevoEquipo />
                  </AdminRoute>
                }
              />
              <Route
                path="/escaner"
                element={
                  <ProtectedRoute>
                    <EscanerQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notificaciones"
                element={
                  <ProtectedRoute>
                    <Notificaciones />
                  </ProtectedRoute>
                }
              />
              <Route path="/ficha/:codigo_hash" element={<FichaPublicaQR />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
