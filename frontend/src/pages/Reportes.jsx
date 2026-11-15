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
import { 
  BarChart3, FileSpreadsheet, Printer, Download, Filter, 
  Search, RefreshCw, Laptop, Wrench, Clock, QrCode, 
  Building2, Users, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Layers, Sparkles, FileText, Calendar, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const API_BASE = API_BASE_URL;

export const Reportes = () => {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados principales
  const [resumen, setResumen] = useState(null);
  const [datosInventario, setDatosInventario] = useState([]);
  const [datosMantenimientos, setDatosMantenimientos] = useState([]);
  const [datosPrestamos, setDatosPrestamos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pestaña activa
  const [tabReporte, setTabReporte] = useState(() => searchParams.get('tab') || 'inventario');

  // Sincronizar pestaña desde URL
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tabReporte) {
      setTabReporte(t);
    }
  }, [searchParams]);

  // Filtros Inventario
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Filtros Mantenimiento
  const [filtroMantTipo, setFiltroMantTipo] = useState('todos');
  const [filtroMantEstado, setFiltroMantEstado] = useState('todos');

  // Filtros Préstamo
  const [filtroPrestEstado, setFiltroPrestEstado] = useState('todos');

  const headers = { 'Authorization': `Bearer ${token}` };

  // Cargar todos los datos
  const cargarReportes = async () => {
    try {
      setLoading(true);

      const [resResumen, resInv, resMant, resPrest, resStats, resUbs] = await Promise.all([
        fetch(`${API_BASE}/reportes/resumen`, { headers }),
        fetch(`${API_BASE}/reportes/inventario`, { headers }),
        fetch(`${API_BASE}/reportes/mantenimientos`, { headers }),
        fetch(`${API_BASE}/reportes/prestamos`, { headers }),
        fetch(`${API_BASE}/reportes/estadisticas`, { headers }),
        fetch(`${API_BASE}/ubicaciones`, { headers })
      ]);

      if (resResumen.ok) setResumen(await resResumen.json());
      if (resInv.ok) setDatosInventario(await resInv.json());
      if (resMant.ok) setDatosMantenimientos(await resMant.json());
      if (resPrest.ok) setDatosPrestamos(await resPrest.json());
      if (resStats.ok) setEstadisticas(await resStats.json());
      if (resUbs.ok) setUbicaciones(await resUbs.json());
    } catch (err) {
      console.error('Error al sincronizar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [token]);

  // Filtrado de Inventario en cliente
  const inventarioFiltrado = datosInventario.filter((item) => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && item.estado !== filtroEstado) return false;
    if (filtroUbicacion && String(item.ubicacion) !== filtroUbicacion && !item.ubicacion?.includes(filtroUbicacion)) return false;
    if (busqueda) {
      const term = busqueda.toLowerCase();
      const matchCod = item.codigo_patrimonial?.toLowerCase().includes(term);
      const matchNom = item.nombre?.toLowerCase().includes(term);
      const matchMarca = item.marca?.toLowerCase().includes(term);
      const matchSerie = item.numero_serie?.toLowerCase().includes(term);
      if (!matchCod && !matchNom && !matchMarca && !matchSerie) return false;
    }
    return true;
  });

  // Filtrado de Mantenimientos
  const mantenimientosFiltrados = datosMantenimientos.filter((m) => {
    if (filtroMantTipo !== 'todos' && m.tipo !== filtroMantTipo) return false;
    if (filtroMantEstado !== 'todos' && m.estado !== filtroMantEstado) return false;
    return true;
  });

  // Filtrado de Préstamos
  const prestamosFiltrados = datosPrestamos.filter((p) => {
    if (filtroPrestEstado !== 'todos' && p.estado !== filtroPrestEstado) return false;
    return true;
  });

  // Función para exportar a CSV con BOM UTF-8 (compatible con Excel en español)
  const exportarCSV = () => {
    let rows = [];
    let filename = `Reporte_${tabReporte}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tabReporte === 'inventario') {
      rows.push(['Código Patrimonial', 'Equipo', 'Tipo', 'Marca', 'Modelo', 'N° Serie', 'Ubicación', 'Pabellón', 'Código QR', 'Estado', 'Fecha Registro']);
      inventarioFiltrado.forEach(i => {
        rows.push([
          `"${i.codigo_patrimonial}"`,
          `"${i.nombre}"`,
          `"${i.tipo}"`,
          `"${i.marca}"`,
          `"${i.modelo}"`,
          `"${i.numero_serie}"`,
          `"${i.ubicacion}"`,
          `"${i.pabellon}"`,
          `"${i.codigo_qr}"`,
          `"${i.estado}"`,
          `"${i.fecha_registro}"`
        ]);
      });
    } else if (tabReporte === 'mantenimientos') {
      rows.push(['Orden N°', 'Equipo', 'Código Patrimonial', 'Tipo Servicio', 'Prioridad', 'Estado', 'Fecha Programada', 'Fecha Completada', 'Técnico Responsable', 'Costo Estimado (S/.)', 'Problema', 'Solución']);
      mantenimientosFiltrados.forEach(m => {
        rows.push([
          `"${m.codigo_orden}"`,
          `"${m.equipo_nombre}"`,
          `"${m.equipo_codigo}"`,
          `"${m.tipo}"`,
          `"${m.prioridad}"`,
          `"${m.estado}"`,
          `"${m.fecha_programada}"`,
          `"${m.fecha_completada}"`,
          `"${m.tecnico_responsable}"`,
          m.costo_estimado,
          `"${m.descripcion_problema.replace(/"/g, '""')}"`,
          `"${m.diagnostico_solucion.replace(/"/g, '""')}"`
        ]);
      });
    } else if (tabReporte === 'prestamos') {
      rows.push(['Código Préstamo', 'Equipo', 'Código Patrimonial', 'Prestatario', 'Correo', 'Rol', 'Ubicación Sede', 'Fecha Préstamo', 'Devolución Estimada', 'Devolución Real', 'Estado', 'Motivo']);
      prestamosFiltrados.forEach(p => {
        rows.push([
          `"${p.codigo_prestamo}"`,
          `"${p.equipo_nombre}"`,
          `"${p.equipo_codigo}"`,
          `"${p.usuario_nombre}"`,
          `"${p.usuario_email}"`,
          `"${p.usuario_rol}"`,
          `"${p.ubicacion_nombre}"`,
          `"${p.fecha_prestamo}"`,
          `"${p.fecha_devolucion_esperada}"`,
          `"${p.fecha_devolucion_real}"`,
          `"${p.estado}"`,
          `"${p.motivo.replace(/"/g, '""')}"`
        ]);
      });
    } else {
      // Resumen ejecutivo
      rows.push(['Métrica', 'Valor']);
      rows.push(['Total de Equipos Registrados', resumen?.total_equipos || 0]);
      rows.push(['Tasa de Operatividad', `${resumen?.tasa_operatividad || 100}%`]);
      rows.push(['Equipos Prestados Activos', resumen?.prestamos_activos || 0]);
      rows.push(['Órdenes de Mantenimiento', resumen?.total_mantenimientos || 0]);
      rows.push(['Inversión en Mantenimiento (S/.)', resumen?.costo_total_mantenimiento || 0]);
      rows.push(['Cobertura Códigos QR', `${resumen?.cobertura_qr || 100}%`]);
    }

    const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir reporte formal institucional
  const imprimirReporte = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Tarjetas de Resumen Superior del Módulo de Reportes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parque Tecnológico</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {resumen?.total_equipos || 0} <span className="text-xs font-semibold text-emerald-600">({resumen?.tasa_operatividad || 100}%)</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Operatividad institucional</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inversión Servicios</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            S/. {resumen?.costo_total_mantenimiento?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
            {resumen?.total_mantenimientos || 0} órdenes registradas
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Préstamos en Uso</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {resumen?.prestamos_activos || 0} <span className="text-xs text-slate-400 font-normal">/ {resumen?.total_prestamos || 0}</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Dispositivos en posesión</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cobertura QR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {resumen?.cobertura_qr || 100}%
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Rotulado y ficha técnica</div>
        </div>
      </div>

      {/* 2. Barra de Control y Acciones de Exportación */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        
        {/* Switcher de Pestañas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setTabReporte('inventario')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabReporte === 'inventario'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            Inventario General ({inventarioFiltrado.length})
          </button>

          <button
            onClick={() => setTabReporte('mantenimientos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabReporte === 'mantenimientos'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Mantenimientos ({mantenimientosFiltrados.length})
          </button>

          <button
            onClick={() => setTabReporte('prestamos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabReporte === 'prestamos'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Trazabilidad de Préstamos ({prestamosFiltrados.length})
          </button>

          <button
            onClick={() => setTabReporte('estadisticas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              tabReporte === 'estadisticas'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Estadísticas & Auditoría
          </button>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportarCSV}
            title="Descargar en formato Excel / CSV compatible"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition transform hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel (CSV)
          </button>

          <button
            onClick={imprimirReporte}
            title="Imprimir o guardar en PDF formal con membrete"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition transform hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar PDF
          </button>

          <button
            onClick={cargarReportes}
            title="Recargar datos de auditoría"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Membrete Institucional exclusivo para Impresión / PDF */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Institución Educativa UCV
            </h1>
            <p className="text-xs text-slate-600 font-semibold">
              Sistema Web de Inventario Tecnológico con Códigos QR
            </p>
            <p className="text-[10px] text-slate-500">
              Reporte Oficial de Auditoría Patrimonial y Control de Activos
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <div><strong>Fecha de Emisión:</strong> {resumen?.fecha_generacion || new Date().toLocaleString()}</div>
            <div><strong>Generado por:</strong> {user?.nombre || 'Administrador'} ({user?.rol})</div>
            <div><strong>Estado del Parque:</strong> {resumen?.tasa_operatividad || 100}% Operativo</div>
          </div>
        </div>
      </div>

      {/* 3. PESTAÑA: REPORTE DE INVENTARIO GENERAL */}
      {tabReporte === 'inventario' && (
        <div className="space-y-4">
          
          {/* Filtros */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between print:hidden">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, equipo o serie..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los tipos</option>
                <option value="computadora">Computadora</option>
                <option value="laptop">Laptop</option>
                <option value="proyector">Proyector</option>
                <option value="tablet">Tablet</option>
                <option value="impresora">Impresora</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los estados</option>
                <option value="operativo">Operativo</option>
                <option value="prestado">En Préstamo</option>
                <option value="en_mantenimiento">En Mantenimiento</option>
                <option value="de_baja">De Baja</option>
              </select>

              <select
                value={filtroUbicacion}
                onChange={(e) => setFiltroUbicacion(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="">Todas las ubicaciones</option>
                {ubicaciones.map(u => (
                  <option key={u.id} value={u.nombre}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Inventario */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Código Patrimonial</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Marca / Modelo</th>
                    <th className="py-3 px-4">N° de Serie</th>
                    <th className="py-3 px-4">Ubicación / Pabellón</th>
                    <th className="py-3 px-4">Código QR</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventarioFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No se encontraron equipos registrados con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    inventarioFiltrado.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {item.codigo_patrimonial}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {item.nombre}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600 font-medium">
                          {item.tipo}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.marca} - {item.modelo}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {item.numero_serie}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{item.ubicacion}</div>
                          <div className="text-[10px] text-slate-400">{item.pabellon}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">
                          {item.codigo_qr}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.estado === 'operativo' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : item.estado === 'prestado'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: REPORTE DE MANTENIMIENTOS */}
      {tabReporte === 'mantenimientos' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex gap-3 items-center justify-between print:hidden">
            <div className="text-xs font-bold text-slate-700">Filtros de Órdenes de Servicio:</div>
            <div className="flex items-center gap-2">
              <select
                value={filtroMantTipo}
                onChange={(e) => setFiltroMantTipo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los tipos</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="calibracion">Calibración</option>
                <option value="limpieza">Limpieza</option>
              </select>

              <select
                value={filtroMantEstado}
                onChange={(e) => setFiltroMantEstado(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los estados</option>
                <option value="programado">Programado</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Orden N°</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Prioridad</th>
                    <th className="py-3 px-4">Técnico Asignado</th>
                    <th className="py-3 px-4">Fecha Programada</th>
                    <th className="py-3 px-4">Costo Estimado</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mantenimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No hay mantenimientos que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    mantenimientosFiltrados.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{m.codigo_orden}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{m.equipo_nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.equipo_codigo}</div>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium">{m.tipo}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.prioridad === 'urgente' ? 'bg-rose-100 text-rose-700' :
                            m.prioridad === 'alta' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.prioridad}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{m.tecnico_responsable}</td>
                        <td className="py-3 px-4 text-slate-600">{m.fecha_programada}</td>
                        <td className="py-3 px-4 font-bold text-indigo-700">S/. {m.costo_estimado.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.estado === 'completado' ? 'bg-emerald-50 text-emerald-700' :
                            m.estado === 'en_proceso' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PESTAÑA: REPORTE DE TRAZABILIDAD Y PRÉSTAMOS */}
      {tabReporte === 'prestamos' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex gap-3 items-center justify-between print:hidden">
            <div className="text-xs font-bold text-slate-700">Filtrar por Estado de Préstamo:</div>
            <select
              value={filtroPrestEstado}
              onChange={(e) => setFiltroPrestEstado(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="todos">Todos los préstamos</option>
              <option value="activo">En posesión activa</option>
              <option value="devuelto">Devueltos a almacén</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Prestatario</th>
                    <th className="py-3 px-4">Ubicación / Sede</th>
                    <th className="py-3 px-4">Fecha Préstamo</th>
                    <th className="py-3 px-4">Límite Devolución</th>
                    <th className="py-3 px-4">Retorno Real</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prestamosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400">
                        No hay préstamos registrados para este criterio.
                      </td>
                    </tr>
                  ) : (
                    prestamosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.codigo_prestamo}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{p.equipo_nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.equipo_codigo}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{p.usuario_nombre}</div>
                          <div className="text-[10px] text-slate-400">{p.usuario_email} ({p.usuario_rol})</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{p.ubicacion_nombre}</td>
                        <td className="py-3 px-4 text-slate-600">{p.fecha_prestamo}</td>
                        <td className="py-3 px-4 text-slate-600">{p.fecha_devolucion_esperada}</td>
                        <td className="py-3 px-4 text-slate-600">{p.fecha_devolucion_real}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.estado === 'activo' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {p.estado === 'activo' ? 'En Uso' : 'Devuelto'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. PESTAÑA: ESTADÍSTICAS Y AUDITORÍA ESTRATÉGICA */}
      {tabReporte === 'estadisticas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Distribución por Tipo de Equipo */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                Distribución por Tipo de Activo
              </h3>
              <div className="space-y-3">
                {estadisticas?.equipos_por_tipo?.map((t, idx) => {
                  const pct = resumen?.total_equipos ? Math.round((t.cantidad / resumen.total_equipos) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{t.tipo}</span>
                        <span className="text-slate-900">{t.cantidad} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distribución por Estado Operativo */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Estado del Parque Tecnológico
              </h3>
              <div className="space-y-3">
                {estadisticas?.equipos_por_estado?.map((e, idx) => {
                  const pct = resumen?.total_equipos ? Math.round((e.cantidad / resumen.total_equipos) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">{e.estado}</span>
                        <span className="text-slate-900">{e.cantidad} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            e.estado.toLowerCase() === 'operativo' ? 'bg-emerald-500' :
                            e.estado.toLowerCase() === 'prestado' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carga por Sede / Ubicación */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Carga por Sede Escolar
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {estadisticas?.equipos_por_ubicacion?.map((u, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{u.ubicacion}</div>
                      <div className="text-[10px] text-slate-400">{u.pabellon}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-white font-bold text-indigo-600 rounded-lg shadow-2xs border border-slate-200">
                      {u.cantidad} equipos
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Dictamen Ejecutivo de Auditoría */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-sky-400 font-bold tracking-wider uppercase">Dictamen Oficial</span>
                <h3 className="text-lg font-bold text-white">Resumen Ejecutivo de Patrimonio y Trazabilidad</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                Auditoría Conforme
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <p>
                • El <strong className="text-white">{resumen?.tasa_operatividad || 100}%</strong> del parque tecnológico escolar se encuentra operativo y apto para sesiones de clases, con rotulado QR en el 100% de los bienes.
              </p>
              <p>
                • Se mantiene trazabilidad activa sobre <strong className="text-white">{resumen?.prestamos_activos || 0} dispositivos</strong> prestados a docentes, registrados en sus sedes correspondientes.
              </p>
              <p>
                • La inversión acumulada en servicios técnicos asciende a <strong className="text-white">S/. {resumen?.costo_total_mantenimiento?.toFixed(2) || '0.00'}</strong> con cero incidencias críticas bloqueantes.
              </p>
              <p>
                • Se recomienda continuar con las inspecciones preventivas en los laboratorios de cómputo del Pabellón A.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pie de Firma Institucional para Impresión / PDF */}
      <div className="hidden print:flex justify-between items-end pt-20 mt-12 text-xs text-slate-800 border-t border-slate-300">
        <div className="text-center w-60">
          <div className="border-t border-slate-900 pt-2 font-bold">Responsable de Inventario</div>
          <div className="text-[10px] text-slate-500">Unidad de Tecnologías de la Información</div>
        </div>
        <div className="text-center w-60">
          <div className="border-t border-slate-900 pt-2 font-bold">Dirección General</div>
          <div className="text-[10px] text-slate-500">Institución Educativa UCV</div>
        </div>
      </div>

    </div>
  );
};
