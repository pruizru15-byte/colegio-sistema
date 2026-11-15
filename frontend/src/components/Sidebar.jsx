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

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Monitor, Users, MapPin, QrCode, 
  Wrench, BarChart3, Settings, GraduationCap, ChevronDown, 
  ChevronRight, ChevronLeft, Laptop, Layers, Box, Plus, Share2, 
  Camera, Printer, Smartphone, Building2, Clock, FileText, 
  AlertTriangle, CheckCircle2, User as UserIcon, Lock, ShieldCheck, Sun
} from 'lucide-react';

export const Sidebar = ({ collapsed = false, toggleSidebar }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Configuración completa de módulos y submódulos correspondientes a pestañas
  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard,
      badge: null,
      submodules: null
    },
    { 
      label: 'Equipos', 
      path: '/inventario', 
      icon: Monitor,
      badge: 'Patrimonio',
      defaultTab: 'catalogo',
      submodules: [
        { label: 'Catálogo General', tab: 'catalogo', icon: Layers },
        { label: 'Monitor por Estados', tab: 'estados', icon: Box },
        { label: 'Registrar Equipo', tab: 'nuevo', icon: Plus },
        { label: 'Control de Préstamos', tab: 'prestamos', icon: Share2 },
        { label: 'Estadísticas y Análisis', tab: 'estadisticas', icon: BarChart3 },
      ]
    },
    { 
      label: 'Códigos QR', 
      path: '/escaner', 
      icon: QrCode,
      badge: 'Lector',
      defaultTab: 'escaner',
      submodules: [
        { label: 'Cámara en Tiempo Real', tab: 'escaner', icon: Camera },
        { label: 'Rotulación e Impresión', tab: 'catalogo', icon: Printer },
        { label: 'Simulador de Ficha Móvil', tab: 'simulador', icon: Smartphone },
      ]
    },
    { 
      label: 'Ubicaciones', 
      path: '/ubicaciones', 
      icon: MapPin,
      badge: 'Aulas',
      defaultTab: 'ambientes',
      submodules: [
        { label: 'Ambientes Escolares', tab: 'ambientes', icon: Building2 },
        { label: 'Trazabilidad y Préstamos', tab: 'prestamos', icon: Clock },
      ]
    },
    { 
      label: 'Mantenimientos', 
      path: '/mantenimientos', 
      icon: Wrench,
      badge: 'Soporte',
      submodules: [
        { label: 'Todas las Órdenes', query: '', icon: FileText },
        { label: 'Programadas', query: 'estado=programado', icon: Clock },
        { label: 'En Proceso', query: 'estado=en_proceso', icon: AlertTriangle },
        { label: 'Completadas', query: 'estado=completado', icon: CheckCircle2 },
        { label: 'Nueva Orden', query: 'accion=nueva', icon: Plus },
      ]
    },
    { 
      label: 'Usuarios', 
      path: '/usuarios', 
      icon: Users,
      badge: null,
      submodules: null
    },
    { 
      label: 'Reportes', 
      path: '/reportes', 
      icon: BarChart3,
      badge: 'Auditoría',
      defaultTab: 'inventario',
      submodules: [
        { label: 'Reporte de Inventario', tab: 'inventario', icon: Layers },
        { label: 'Reporte de Mantenimientos', tab: 'mantenimientos', icon: Wrench },
        { label: 'Reporte de Préstamos', tab: 'prestamos', icon: Share2 },
        { label: 'Estadísticas del Colegio', tab: 'estadisticas', icon: BarChart3 },
      ]
    },
    { 
      label: 'Configuración', 
      path: '/perfil', 
      icon: Settings,
      badge: null,
      defaultTab: 'datos',
      submodules: [
        { label: 'Datos Personales', tab: 'datos', icon: UserIcon },
        { label: 'Seguridad y Contraseña', tab: 'password', icon: Lock },
        { label: 'Permisos del Rol', tab: 'permisos', icon: ShieldCheck },
        { label: 'Preferencias de UI', tab: 'preferencias', icon: Sun },
      ]
    },
  ];

  // Acordeón limpio: solo el módulo activo se despliega para que NUNCA sobrepase la altura ni requiera scroll
  const [openMenu, setOpenMenu] = useState(() => {
    const current = menuItems.find(m => location.pathname.startsWith(m.path));
    return current && current.submodules ? current.path : '/inventario';
  });

  // Menú en hover cuando la barra está plegada
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // Sincronizar menú abierto al cambiar de ruta
  useEffect(() => {
    const current = menuItems.find(m => location.pathname.startsWith(m.path));
    if (current && current.submodules) {
      setOpenMenu(current.path);
    }
  }, [location.pathname]);

  // Alternar apertura/cierre de submódulos
  const toggleMenu = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenu(prev => prev === path ? null : path);
  };

  // Evaluar si una ruta principal está activa
  const isModuleActive = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  // Evaluar si un submódulo específico está activo
  const isSubmoduleActive = (item, sub) => {
    if (location.pathname !== item.path) return false;

    if (sub.tab !== undefined) {
      const currentTab = searchParams.get('tab') || item.defaultTab;
      return currentTab === sub.tab;
    }

    if (sub.query !== undefined) {
      if (!sub.query) {
        return !searchParams.get('estado') && !searchParams.get('accion');
      }
      const [key, val] = sub.query.split('=');
      return searchParams.get(key) === val;
    }

    return false;
  };

  return (
    <aside 
      className={`bg-[#09101d] text-slate-300 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 z-40 select-none shadow-xl transition-all duration-300 relative overflow-visible ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      
      {/* Botón Flotante para Plegar / Desplegar la barra lateral */}
      {toggleSidebar && (
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Desplegar menú lateral" : "Plegar menú lateral"}
          className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-[#09101d] z-50 transition transform hover:scale-110 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* 1. Cabecera y Marca Institucional */}
      <div>
        <div className={`p-3.5 border-b border-slate-800/80 flex items-center transition-all ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center p-2 shadow-lg shadow-blue-500/25 flex-shrink-0">
            <QrCode className="w-full h-full" />
          </div>
          
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <span>Inventario QR</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-xs font-black text-white tracking-tight">
                Colegio UCV
              </h2>
            </div>
          )}
        </div>

        {/* Badge Institucional */}
        {!collapsed ? (
          <div className="px-3 pt-2.5 pb-1">
            <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[10px] font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span className="truncate">Sede Central</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-sky-300">
                Activo
              </span>
            </div>
          </div>
        ) : (
          <div className="px-2 pt-2 pb-1 flex justify-center">
            <div className="p-1.5 rounded-xl bg-slate-800/40 text-sky-400" title="Institución Educativa UCV">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* 2. Lista de Módulos con Desplegables de Submódulos (Sin Scroll) */}
        <nav className="px-2.5 py-2 space-y-0.5">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isModuleActive(item.path);
            const hasSubmodules = item.submodules && item.submodules.length > 0;
            const isExpanded = !collapsed && openMenu === item.path;
            const isHovered = collapsed && hoveredMenu === item.path;

            return (
              <div 
                key={idx} 
                className="space-y-0.5 relative"
                onMouseEnter={() => collapsed && setHoveredMenu(item.path)}
                onMouseLeave={() => collapsed && setHoveredMenu(null)}
              >
                
                {/* Botón / Enlace del Módulo Principal */}
                <div
                  className={`group flex items-center justify-between rounded-xl text-xs font-semibold transition-all duration-150 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-blue-600/15 text-white font-bold border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Link
                    to={item.submodules && item.defaultTab ? `${item.path}?tab=${item.defaultTab}` : item.path}
                    onClick={() => {
                      if (hasSubmodules && !collapsed) {
                        setOpenMenu(item.path);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center ${
                      collapsed 
                        ? 'p-2.5 justify-center w-full' 
                        : 'flex-1 gap-2.5 px-3 py-2'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    
                    {!collapsed && (
                      <>
                        <span className="truncate text-xs">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 ml-auto mr-1">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>

                  {/* Flecha desplegable en modo expandido */}
                  {!collapsed && hasSubmodules && (
                    <button
                      onClick={(e) => toggleMenu(item.path, e)}
                      title={isExpanded ? "Ocultar submódulos" : "Mostrar submódulos"}
                      className="p-1.5 text-slate-400 hover:text-white rounded-r-xl transition"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Submódulos Desplegables en MODO EXPANDIDO */}
                {!collapsed && hasSubmodules && isExpanded && (
                  <div className="ml-4 pl-3 border-l border-slate-800/80 py-0.5 space-y-0.5">
                    {item.submodules.map((sub, sIdx) => {
                      const SubIcon = sub.icon;
                      const subActive = isSubmoduleActive(item, sub);
                      const targetUrl = sub.tab !== undefined 
                        ? `${item.path}?tab=${sub.tab}` 
                        : `${item.path}${sub.query ? '?' + sub.query : ''}`;

                      return (
                        <Link
                          key={sIdx}
                          to={targetUrl}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            subActive
                              ? 'bg-sky-500/20 text-sky-300 font-bold border-l-2 border-sky-400'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <SubIcon className={`w-3 h-3 flex-shrink-0 ${subActive ? 'text-sky-400' : 'text-slate-500'}`} />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Submódulos Flotantes (POPOVER FLYOUT) en MODO PLEGADO */}
                {collapsed && isHovered && (
                  <div 
                    className="absolute left-full top-0 ml-2 w-52 bg-[#09101d] border border-slate-700/80 rounded-2xl p-2 shadow-2xl z-50 text-xs animate-fadeIn"
                    style={{ minWidth: '200px' }}
                  >
                    <div className="px-2.5 py-1 mb-1 border-b border-slate-800 text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-normal">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {hasSubmodules ? (
                      <div className="space-y-0.5">
                        {item.submodules.map((sub, sIdx) => {
                          const SubIcon = sub.icon;
                          const subActive = isSubmoduleActive(item, sub);
                          const targetUrl = sub.tab !== undefined 
                            ? `${item.path}?tab=${sub.tab}` 
                            : `${item.path}${sub.query ? '?' + sub.query : ''}`;

                          return (
                            <Link
                              key={sIdx}
                              to={targetUrl}
                              onClick={() => setHoveredMenu(null)}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition ${
                                subActive
                                  ? 'bg-sky-500/20 text-sky-300 font-bold border-l-2 border-sky-400'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                              }`}
                            >
                              <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${subActive ? 'text-sky-400' : 'text-slate-500'}`} />
                              <span className="truncate">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 text-slate-400 text-[11px]">
                        Acceso directo al módulo
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </nav>
      </div>

      {/* 3. Sección Inferior Compacta (Sin sobrecargar altura) */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>En Línea</span>
            </div>
            <span className="font-mono text-slate-500 text-[9px]">v2.5.0</span>
          </div>
        ) : (
          <div className="flex justify-center" title="En Línea • v2.5.0">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        )}
      </div>

    </aside>
  );
};
