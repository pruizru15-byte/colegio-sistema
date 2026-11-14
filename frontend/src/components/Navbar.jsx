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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, Monitor, PlusCircle, ScanLine, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo e Identidad */}
          <div className="flex items-center gap-3">
            <Link to="/inventario" className="flex items-center gap-2 text-blue-600 font-bold text-lg hover:opacity-90">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-semibold text-slate-800">Inventario QR Colegio</span>
            </Link>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/inventario"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/inventario')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Inventario</span>
            </Link>

            {isAdmin && (
              <Link
                to="/equipos/nuevo"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive('/equipos/nuevo')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Equipo</span>
              </Link>
            )}

            <Link
              to="/escaner"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive('/escaner')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              <span>Escanear QR</span>
            </Link>
          </nav>

          {/* Usuario y Cierre de Sesión */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-medium text-slate-900">{user.nombre}</span>
                  <span className="text-xs text-blue-600 uppercase font-semibold">{user.rol}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
              >
                Ingresar
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

