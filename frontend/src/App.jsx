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
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Inventario } from './pages/Inventario';
import { NuevoEquipo } from './pages/NuevoEquipo';
import { FichaPublicaQR } from './pages/FichaPublicaQR';
import { EscanerQR } from './pages/EscanerQR';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/inventario" replace />;
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Sistema de Inventario Tecnológico con Códigos QR • Colegio
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <Inventario />
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
            <Route path="/escaner" element={<EscanerQR />} />
            <Route path="/ficha/:codigo_hash" element={<FichaPublicaQR />} />
            <Route path="*" element={<Navigate to="/inventario" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
