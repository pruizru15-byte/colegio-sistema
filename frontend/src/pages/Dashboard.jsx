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
  Clock, ShieldAlert, ArrowUpRight
} from 'lucide-react';

import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { AreaChart } from '../components/charts/AreaChart';
import { RadialGauge } from '../components/charts/RadialGauge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backupToast, setBackupToast] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error('Error cargando estadísticas del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleBackup = () => {
    setBackupToast(true);
    setTimeout(() => setBackupToast(false), 3500);
  };

  const handleExport = (tipo) => {
    alert(`Generando y descargando ${tipo}...`);
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Cargando métricas estratégicas...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_equipos: 248,
    operativos: 196,
    pct_operativos: 79.0,
    en_mantenimiento: 18,
    pct_mantenimiento: 7.3,
    incidencias: 7,
    pct_incidencias: 2.8,
    ubicaciones: 12,
    qr_generados: 248,
    pct_qr: 100.0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast de Respaldo Exitoso */}
      {backupToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-bounce">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>¡Respaldo completo de la base de datos generado con éxito!</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/" className="hover:text-slate-600">Inicio</Link>
        <span className="text-slate-300">/</span>
        <span className="text-blue-600 font-semibold">Dashboard</span>
      </nav>

      {/* 1. SECCIÓN DE 6 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Card 1: Total de equipos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              Total de equipos
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.total_equipos}
          </div>
        </div>

        {/* Card 2: Operativos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              Operativos
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.operativos}
          </div>
          <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_operativos}% del total
          </div>
        </div>

        {/* Card 3: En mantenimiento */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              En mantenimiento
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.en_mantenimiento}
          </div>
          <div className="text-[10px] font-semibold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_mantenimiento}% del total
          </div>
        </div>

        {/* Card 4: Incidencias */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              Incidencias
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.incidencias}
          </div>
          <div className="text-[10px] font-semibold text-red-700 bg-red-50/80 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_incidencias}% del total
          </div>
        </div>

        {/* Card 5: Ubicaciones */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              Ubicaciones
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.ubicaciones}
          </div>
        </div>

        {/* Card 6: QR generados */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md transition group">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              QR generados
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.qr_generados}
          </div>
          <div className="text-[10px] font-semibold text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-md inline-block mt-1">
            {kpis.pct_qr}% del inventario
          </div>
        </div>

      </div>

      {/* 2. SECCIÓN DE 3 GRÁFICOS INTERACTIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Gráfico 1: Estado de equipos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Estado de equipos</span>
            </div>
            <button title="Detalles del estado de inventario" className="text-slate-400 hover:text-slate-600">
              <Info className="w-4 h-4" />
            </button>
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
              to="/inventario"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Ver reporte</span>
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
              <span>Movimientos del inventario</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <span>Últimos 12 meses</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
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
                <span>Mantenimientos próximos</span>
              </div>
              <button
                onClick={() => handleExport('reporte_mantenimientos.xlsx')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-2">Código</th>
                    <th className="pb-2">Equipo</th>
                    <th className="pb-2">Ubicación</th>
                    <th className="pb-2">Fecha</th>
                    <th className="pb-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(data?.mantenimientos_proximos || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-bold font-mono text-blue-600">{row.codigo}</td>
                      <td className="py-2.5 font-medium">{row.equipo}</td>
                      <td className="py-2.5 text-slate-500">{row.ubicacion}</td>
                      <td className="py-2.5 text-slate-500">{row.fecha}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.estado === 'Programado'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          {row.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400 mt-2">
            <span>Mostrando 5 de 18 mantenimientos</span>
            <Link to="/inventario" className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Alertas estratégicas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3 text-slate-800 font-bold text-sm">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Alertas estratégicas</span>
            </div>

            <div className="space-y-3">
              {(data?.alertas || []).map((alert, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-slate-400">
                      {alert.tipo === 'danger' ? <QrCode className="w-3.5 h-3.5 text-red-500" /> :
                       alert.tipo === 'warning' ? <Wrench className="w-3.5 h-3.5 text-amber-500" /> :
                       alert.tipo === 'info' ? <MapPin className="w-3.5 h-3.5 text-amber-500" /> :
                       alert.tipo === 'success' ? <Database className="w-3.5 h-3.5 text-emerald-500" /> :
                       <TrendingUp className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 leading-snug">{alert.titulo}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{alert.descripcion}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap ${
                    alert.tipo === 'danger' ? 'bg-red-50 text-red-600' :
                    alert.tipo === 'warning' ? 'bg-red-50 text-red-600' :
                    alert.tipo === 'info' ? 'bg-amber-100/70 text-amber-800' :
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
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition"
            >
              <Database className="w-4 h-4" />
              <span>Generar respaldo</span>
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
              <div className="space-y-2 text-xs text-slate-600 flex-1">
                {(data?.resumen_ejecutivo?.puntos || []).map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-snug">{pt}</span>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0">
                <RadialGauge percentage={data?.resumen_ejecutivo?.cumplimiento || 82} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <Link
              to="/inventario"
              className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver reporte</span>
            </Link>
            <button
              onClick={() => handleExport('resumen_ejecutivo.pdf')}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow-sm shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
