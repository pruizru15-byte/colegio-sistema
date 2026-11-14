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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Laptop, Search, Bell, Sun, Moon, LaptopMinimal, 
  ChevronDown, Check, User, LogOut, Settings, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationModal } from './NotificationModal';
import { SearchModal } from './SearchModal';

export const TopHeader = ({ notifications = [] }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [themeOpen, setThemeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const themeOptions = [
    { id: 'claro', label: 'Claro', icon: Sun },
    { id: 'oscuro', label: 'Oscuro', icon: Moon },
    { id: 'combinado', label: 'Combinado', icon: LaptopMinimal },
  ];

  const currentTheme = themeOptions.find((t) => t.id === theme) || themeOptions[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* Título y Subtítulo Institucional */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              Sistema de Inventario Tecnológico con Códigos QR
            </h1>
            <p className="text-xs text-slate-400 font-medium">Institución Educativa</p>
          </div>
        </div>

        {/* Barra de Búsqueda, Notificaciones y Perfil */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Barra de búsqueda interactiva (Ctrl + K) */}
          <div
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-3 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer transition w-64 shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs flex-1">Buscar equipo, código, ubicación...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded-md text-slate-500 shadow-2xs">
              Ctrl + K
            </kbd>
          </div>

          {/* Botón de Notificaciones con Badge */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition relative"
              title="Notificaciones y alertas"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>
            <NotificationModal
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
            />
          </div>

          {/* Selector de Tema (Dropdown de la imagen) */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <CurrentIcon className="w-4 h-4 text-slate-500" />
              <span>{currentTheme.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {themeOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeOpen(false);
                      }}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 text-slate-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Perfil de Usuario con Menú Desplegable */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {(user?.nombre || 'AD').substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-800">
                  {user?.nombre || 'Estudiante UCV'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold capitalize">
                  {user?.rol || 'Administrador'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Menú Desplegable del Usuario */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900 truncate">{user?.nombre}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 capitalize">
                      {user?.rol}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Mi Perfil & Seguridad</span>
                  </Link>

                  <Link
                    to="/inventario"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition font-medium"
                  >
                    <Laptop className="w-4 h-4 text-slate-400" />
                    <span>Inventario de Equipos</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal de Búsqueda Global */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
