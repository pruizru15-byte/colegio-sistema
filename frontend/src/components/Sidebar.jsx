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
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Monitor, Users, MapPin, QrCode, 
  Wrench, BarChart3, Settings, GraduationCap, Laptop
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Equipos', path: '/inventario', icon: Monitor },
    { label: 'Usuarios', path: '/usuarios', icon: Users },
    { label: 'Ubicaciones', path: '/inventario', icon: MapPin },
    { label: 'Códigos QR', path: '/escaner', icon: QrCode },
    { label: 'Mantenimientos', path: '/inventario', icon: Wrench },
    { label: 'Reportes', path: '/inventario', icon: BarChart3 },
    { label: 'Configuración', path: '/inventario', icon: Settings },
  ];

  const isCurrentActive = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === itemPath;
  };

  return (
    <aside className="w-64 bg-[#09101d] text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800 flex-shrink-0 z-40 select-none">
      
      {/* Sección Superior: Logo y Navegación */}
      <div>
        {/* Cabecera / Marca del Sistema */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center p-2.5 shadow-lg shadow-blue-500/20">
            <QrCode className="w-full h-full" />
          </div>
          <div className="leading-tight">
            <h2 className="text-xs font-extrabold text-white tracking-wide">
              Sistema de
            </h2>
            <h2 className="text-xs font-extrabold text-white tracking-wide">
              Inventario
            </h2>
            <h2 className="text-xs font-extrabold text-white tracking-wide">
              Tecnológico
            </h2>
            <p className="text-[10px] text-sky-400 font-medium">con Códigos QR</p>
          </div>
        </div>

        {/* Botón / Badge Institucional */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Institución Educativa</span>
          </div>
        </div>

        {/* Menú de Opciones */}
        <nav className="px-3 py-3 space-y-1.5">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.path);

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior: Silueta Arquitectónica del Colegio */}
      <div className="p-4 relative overflow-hidden">
        <div className="opacity-30 hover:opacity-50 transition duration-300 flex flex-col items-center">
          {/* Ilustración de Escuela / Colegio en SVG */}
          <svg
            className="w-32 h-20 text-sky-400"
            viewBox="0 0 120 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Frontón triangular */}
            <path d="M 15 35 L 60 15 L 105 35 Z" fill="currentColor" fillOpacity="0.1" />
            {/* Campanario y reloj */}
            <rect x="52" y="5" width="16" height="10" rx="1" />
            <circle cx="60" cy="10" r="2.5" />
            <line x1="60" y1="2" x2="60" y2="5" />
            {/* Columnas clásicas */}
            <rect x="25" y="35" width="6" height="28" rx="0.5" />
            <rect x="42" y="35" width="6" height="28" rx="0.5" />
            <rect x="57" y="35" width="6" height="28" rx="0.5" />
            <rect x="72" y="35" width="6" height="28" rx="0.5" />
            <rect x="89" y="35" width="6" height="28" rx="0.5" />
            {/* Base y gradas */}
            <rect x="10" y="63" width="100" height="4" rx="1" />
          </svg>
          {/* Ondas decorativas inferiores */}
          <svg className="w-full h-6 text-sky-500/20 -mt-2" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

    </aside>
  );
};
