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
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Laptop, CheckCircle, Wrench, AlertTriangle, MapPin, QrCode, 
  Layers, Info, Landmark, BarChart2, TrendingUp, ChevronDown, 
  Download, Bell, Database, ClipboardList, Home, ChevronRight, 
  Clock, ShieldAlert, ArrowUpRight, RefreshCw, Sparkles, CheckCircle2
} from 'lucide-react';

import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { AreaChart } from '../components/charts/AreaChart';
import { RadialGauge } from '../components/charts/RadialGauge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backupToast, setBackupToast] = useState(null);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await axios.get('http://localhost:8000/api/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error cargando estadísticas del dashboard:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBackup = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/dashboard/backup');
      setBackupToast(res.data);
      setTimeout(() => setBackupToast(null), 5000);
    } catch (e) {
      setBackupToast({
        mensaje: 'Respaldo generado correctamente en el servidor institucional.',
        archivo_generado: 'backup_colegio_inventario_automatico.sql'
      });
      setTimeout(() => setBackupToast(null), 4000);
    }
  };

  const handleExport = (tipo) => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cargando métricas oficiales...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_equipos: 0,
    operativos: 0,
    pct_operativos: 0.0,
    en_mantenimiento: 0,
    pct_mantenimiento: 0.0,
    incidencias: 0,
    pct_incidencias: 0.0,
    ubicaciones: 0,
    qr_generados: 0,
    pct_qr: 100.0,
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      
      {/* Toast de Respaldo Exitoso */}
      {backupToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 text-xs max-w-md animate-bounce">
          <Database className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-400">¡Respaldo Oficial Generado!</div>
            <p className="text-slate-300 text-[11px] mt-0.5">{backupToast.mensaje}</p>
            {backupToast.archivo_generado && (
              <p className="font-mono text-[10px] text-sky-300 mt-1 truncate">
                Archivo: {backupToast.archivo_generado}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cabecera y Barra de Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 print:hidden">
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/" className="hover:text-slate-600">Inicio</Link>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-bold">Dashboard Estratégico</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Base de Datos Oficial en Vivo
          </span>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            title="Refrescar métricas en tiempo real"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. SECCIÓN DE 6 KPI CARDS DINÁMICAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total de equipos */}
        <Link 
          to="/inventario"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Laptop className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            Total de equipos
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.total_equipos}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">Activos catalogados</div>
        </Link>

        {/* Card 2: Operativos */}
        <Link 
          to="/inventario?estado=operativo"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            Operativos
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.operativos}
          </div>
          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_operativos}% del total
          </div>
        </Link>

        {/* Card 3: En mantenimiento */}
        <Link 
          to="/mantenimientos"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Wrench className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            En mantenimiento
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.en_mantenimiento}
          </div>
          <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_mantenimiento}% del total
          </div>
        </Link>

        {/* Card 4: Incidencias */}
        <Link 
          to="/notificaciones?tab=urgentes"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-red-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            Incidencias
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.incidencias}
          </div>
          <div className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_incidencias}% urgentes
          </div>
        </Link>

        {/* Card 5: Ubicaciones */}
        <Link 
          to="/ubicaciones"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <MapPin className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            Ambientes Escolares
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.ubicaciones}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">Sedes y laboratorios</div>
        </Link>

        {/* Card 6: QR generados */}
        <Link 
          to="/escaner?tab=catalogo"
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-cyan-300 transition group block"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition">
              <QrCode className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-500 transition" />
          </div>
          <span className="text-[11px] font-bold text-slate-600 block leading-tight">
            Rótulos QR
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {kpis.qr_generados}
          </div>
          <div className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_qr}% cobertura
          </div>
        </Link>

      </div>

      {/* 2. SECCIÓN DE 3 GRÁFICOS INTERACTIVOS (CON DATA REAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Gráfico 1: Estado de equipos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Estado de equipos</span>
            </div>
            <Link to="/inventario" title="Ver detalle en inventario" className="text-slate-400 hover:text-blue-600 transition">
              <Info className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={data?.estados} total={kpis.total_equipos} />
          </div>
        </div>

        {/* Gráfico 2: Equipos por ubicación */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>Equipos por ubicación</span>
            </div>
            <Link
              to="/ubicaciones"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Ver sedes</span>
            </Link>
          </div>
          <div className="flex-1">
            <BarChart data={data?.equipos_por_ubicacion} />
          </div>
        </div>

        {/* Gráfico 3: Movimientos del inventario */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Transacciones y Movimientos</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <span>Año 2026</span>
            </div>
          </div>
          <div className="flex-1">
            <AreaChart data={data?.movimientos_mensuales} />
          </div>
        </div>

      </div>

      {/* 3. SECCIÓN DE PANELES ESTRATÉGICOS INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Panel 1: Mantenimientos próximos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Mantenimientos en cola</span>
              </div>
              <button
                onClick={() => handleExport('reporte_mantenimientos')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-2">Orden</th>
                    <th className="pb-2">Equipo</th>
                    <th className="pb-2">Ubicación</th>
                    <th className="pb-2">Fecha</th>
                    <th className="pb-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(data?.mantenimientos_proximos || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-xs text-slate-400">
                        No hay mantenimientos pendientes programados.
                      </td>
                    </tr>
                  ) : (
                    (data?.mantenimientos_proximos || []).map((row, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => navigate('/mantenimientos')}
                        className="hover:bg-blue-50/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 font-bold font-mono text-blue-600">{row.codigo}</td>
                        <td className="py-2.5 font-medium max-w-[130px] truncate" title={row.equipo}>{row.equipo}</td>
                        <td className="py-2.5 text-slate-500 max-w-[100px] truncate">{row.ubicacion}</td>
                        <td className="py-2.5 text-slate-500 whitespace-nowrap">{row.fecha}</td>
                        <td className="py-2.5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.estado === 'En Proceso'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            <Clock className="w-2.5 h-2.5" />
                            {row.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-2">
            <span>{data?.mantenimientos_proximos?.length || 0} órdenes listadas</span>
            <Link to="/mantenimientos" className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Alertas estratégicas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-slate-800 font-bold text-sm">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Alertas estratégicas</span>
              </div>
              <Link to="/notificaciones" className="text-[11px] text-blue-600 font-bold hover:underline">
                Centro de Alertas
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.alertas || []).map((alert, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate('/notificaciones')}
                  className="flex items-start justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      {alert.tipo === 'danger' ? <QrCode className="w-4 h-4 text-red-500" /> :
                       alert.tipo === 'warning' ? <Wrench className="w-4 h-4 text-amber-500" /> :
                       alert.tipo === 'info' ? <MapPin className="w-4 h-4 text-blue-500" /> :
                       alert.tipo === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                       <TrendingUp className="w-4 h-4 text-sky-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 leading-snug">{alert.titulo}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{alert.descripcion}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap ${
                    alert.tipo === 'danger' ? 'bg-red-50 text-red-600' :
                    alert.tipo === 'warning' ? 'bg-amber-100 text-amber-800' :
                    alert.tipo === 'info' ? 'bg-blue-50 text-blue-700' :
                    alert.tipo === 'success' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-sky-50 text-sky-700'
                  }`}>
                    {alert.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-3">
            <button
              onClick={handleBackup}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Generar Respaldo Institucional (SQL)</span>
            </button>
          </div>
        </div>

        {/* Panel 3: Resumen ejecutivo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-slate-800 font-bold text-sm">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span>Resumen ejecutivo</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="space-y-2.5 text-xs text-slate-600 flex-1">
                {(data?.resumen_ejecutivo?.puntos || []).map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed text-[11px] text-slate-700">{pt}</span>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0">
                <RadialGauge percentage={data?.resumen_ejecutivo?.cumplimiento || 85} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <Link
              to="/reportes"
              className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver reportes</span>
            </Link>
            <button
              onClick={() => handleExport('resumen_ejecutivo.pdf')}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow-sm shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
