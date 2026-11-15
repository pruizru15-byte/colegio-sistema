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

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Bell, AlertTriangle, CheckCircle, Clock, Trash2, 
  ExternalLink, Search, Filter, Plus, RefreshCw, 
  CheckCheck, ShieldCheck, QrCode, Wrench, Share2, 
  Layers, Megaphone, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getNotificacionesApi, marcarNotificacionLeidaApi, 
  marcarTodasNotificacionesLeidasApi, createNotificacionApi, 
  deleteNotificacionApi 
} from '../services/api';

export const Notificaciones = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pestañas: 'todas' | 'urgentes' | 'mantenimiento' | 'prestamo' | 'nueva'
  const [tabActiva, setTabActiva] = useState(() => searchParams.get('tab') || 'todas');

  const [data, setData] = useState({
    total: 0,
    no_leidas: 0,
    urgentes: 0,
    advertencias: 0,
    informativas: 0,
    notificaciones: [],
  });

  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSoloNoLeidas, setFiltroSoloNoLeidas] = useState(false);

  // Formulario para emitir nuevo comunicado / alerta
  const [nuevoForm, setNuevoForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'warning',
    categoria: 'sistema',
    enlace_url: '',
  });
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Sincronizar pestaña con la URL
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tabActiva) {
      setTabActiva(t);
    }
  }, [searchParams]);

  const cambiarPestaña = (tab) => {
    setTabActiva(tab);
    setSearchParams({ tab });
  };

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      const res = await getNotificacionesApi();
      setData(res);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  // Marcar una notificación como leída
  const handleMarcarLeida = async (id) => {
    try {
      await marcarNotificacionLeidaApi(id);
      setData(prev => ({
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1),
        notificaciones: prev.notificaciones.map(n => n.id === id ? { ...n, leido: true } : n)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Marcar todas como leídas
  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasNotificacionesLeidasApi();
      setData(prev => ({
        ...prev,
        no_leidas: 0,
        notificaciones: prev.notificaciones.map(n => ({ ...n, leido: true }))
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar notificación
  const handleEliminar = async (id) => {
    try {
      await deleteNotificacionApi(id);
      setData(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        notificaciones: prev.notificaciones.filter(n => n.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Emitir nueva alerta / comunicado
  const handleEmitirAlerta = async (e) => {
    e.preventDefault();
    setEnviandoForm(true);
    setMensajeExito('');
    try {
      await createNotificacionApi(nuevoForm);
      setMensajeExito('Comunicado escolar publicado exitosamente en el sistema.');
      setNuevoForm({
        titulo: '',
        descripcion: '',
        tipo: 'warning',
        categoria: 'sistema',
        enlace_url: '',
      });
      fetchNotificaciones();
    } catch (err) {
      alert('Error al emitir comunicado');
    } finally {
      setEnviandoForm(false);
    }
  };

  // Filtrado de notificaciones según pestaña y búsqueda
  const notificacionesFiltradas = useMemo(() => {
    return data.notificaciones.filter((item) => {
      // Filtro por pestaña
      if (tabActiva === 'urgentes') {
        if (item.tipo !== 'danger' && item.tipo !== 'warning') return false;
      } else if (tabActiva === 'mantenimiento') {
        if (item.categoria !== 'mantenimiento') return false;
      } else if (tabActiva === 'prestamo') {
        if (item.categoria !== 'prestamo') return false;
      }

      // Filtro solo no leídas
      if (filtroSoloNoLeidas && item.leido) return false;

      // Filtro de búsqueda textual
      if (busqueda.trim()) {
        const term = busqueda.toLowerCase();
        const mTit = item.titulo?.toLowerCase().includes(term);
        const mDesc = item.descripcion?.toLowerCase().includes(term);
        if (!mTit && !mDesc) return false;
      }

      return true;
    });
  }, [data.notificaciones, tabActiva, filtroSoloNoLeidas, busqueda]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      
      {/* 1. Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Centro de Monitoreo
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Alertas del colegio en tiempo real
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Notificaciones y Alertas</span>
          </h1>
          <p className="text-xs text-slate-500">
            Avisos de vencimiento de préstamos, mantenimientos urgentes y comunicados del inventario escolar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data.no_leidas > 0 && (
            <button
              onClick={handleMarcarTodasLeidas}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              Marcar todo como leído
            </button>
          )}

          <button
            onClick={fetchNotificaciones}
            title="Recargar alertas"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => cambiarPestaña('nueva')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <Megaphone className="w-4 h-4" />
            Emitir Comunicado
          </button>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div 
          onClick={() => { cambiarPestaña('todas'); setFiltroSoloNoLeidas(false); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Alertas</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.total}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Historial acumulado</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('todas'); setFiltroSoloNoLeidas(true); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-amber-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">No Leídas</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{data.no_leidas}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Requieren atención</div>
        </div>

        <div 
          onClick={() => cambiarPestaña('urgentes')}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-rose-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Críticas / Urgentes</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{data.urgentes}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">Fallas o préstamos vencidos</div>
        </div>

        <div 
          onClick={() => cambiarPestaña('prestamo')}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-sky-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Préstamos Escolar</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600">
            {data.notificaciones.filter(n => n.categoria === 'prestamo').length}
          </div>
          <div className="text-[10px] text-sky-700 font-semibold mt-0.5">Vencimientos y salidas</div>
        </div>

      </div>

      {/* 3. Barra de Pestañas y Filtros */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Switcher de Pestañas */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => cambiarPestaña('todas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'todas'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Todas ({data.total})
          </button>

          <button
            onClick={() => cambiarPestaña('urgentes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'urgentes'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Alertas Críticas ({data.urgentes})
          </button>

          <button
            onClick={() => cambiarPestaña('mantenimiento')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'mantenimiento'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Mantenimientos
          </button>

          <button
            onClick={() => cambiarPestaña('prestamo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'prestamo'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Préstamos
          </button>

          <button
            onClick={() => cambiarPestaña('nueva')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'nueva'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Publicar Aviso
          </button>
        </div>

        {/* Buscador y Toggle No Leídas */}
        {tabActiva !== 'nueva' && (
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en avisos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <button
              onClick={() => setFiltroSoloNoLeidas(!filtroSoloNoLeidas)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                filtroSoloNoLeidas
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Solo no leídas
            </button>
          </div>
        )}
      </div>

      {/* 4. Lista Principal de Notificaciones */}
      {tabActiva !== 'nueva' ? (
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs font-semibold">Sincronizando centro de notificaciones...</p>
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Bandeja al día</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hay notificaciones pendientes en esta categoría. Todo el equipamiento escolar se encuentra operando bajo control.
              </p>
            </div>
          ) : (
            notificacionesFiltradas.map((item) => {
              const isDanger = item.tipo === 'danger';
              const isWarning = item.tipo === 'warning';
              const isSuccess = item.tipo === 'success';

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !item.leido 
                      ? 'border-blue-300 bg-blue-50/20' 
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-2xl mt-0.5 flex-shrink-0 ${
                      isDanger ? 'bg-rose-100 text-rose-600' :
                      isWarning ? 'bg-amber-100 text-amber-600' :
                      isSuccess ? 'bg-emerald-100 text-emerald-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {isDanger ? <AlertTriangle className="w-5 h-5" /> :
                       isWarning ? <Clock className="w-5 h-5" /> :
                       isSuccess ? <CheckCircle className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDanger ? 'bg-rose-100 text-rose-800' :
                          isWarning ? 'bg-amber-100 text-amber-800' :
                          isSuccess ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.categoria}
                        </span>

                        {!item.leido && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            Nueva
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : 'Reciente'}
                        </span>
                      </div>

                      <h3 className={`text-sm ${!item.leido ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {item.titulo}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {item.enlace_url && (
                      <Link
                        to={item.enlace_url}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Ir al módulo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!item.leido && (
                      <button
                        onClick={() => handleMarcarLeida(item.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition"
                        title="Marcar como leída"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleEliminar(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (

        /* 5. PESTAÑA: EMITIR NUEVO COMUNICADO / ALERTA */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Publicar Comunicado o Alerta Institucional
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta alerta aparecerá en el centro de notificaciones de todos los docentes y administradores.
            </p>
          </div>

          {mensajeExito && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <form onSubmit={handleEmitirAlerta} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Título del Aviso <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nuevoForm.titulo}
                onChange={(e) => setNuevoForm({ ...nuevoForm, titulo: e.target.value })}
                placeholder="Ej: Auditoría obligatoria de laptops en Laboratorio A"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nivel de Alerta</label>
                <select
                  value={nuevoForm.tipo}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, tipo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="warning">🟡 Advertencia / Recordatorio</option>
                  <option value="danger">🔴 Urgente / Crítico</option>
                  <option value="info">🔵 Informativo</option>
                  <option value="success">🟢 Exitoso / Comunicado Oficial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                <select
                  value={nuevoForm.categoria}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="sistema">Sistema General</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="prestamo">Préstamo de Equipos</option>
                  <option value="equipo">Inventario y Hardware</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mensaje o Descripción <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={nuevoForm.descripcion}
                onChange={(e) => setNuevoForm({ ...nuevoForm, descripcion: e.target.value })}
                placeholder="Detalla las instrucciones o el motivo del aviso escolar..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/30 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enlace de Destino (Opcional)</label>
              <input
                type="text"
                value={nuevoForm.enlace_url}
                onChange={(e) => setNuevoForm({ ...nuevoForm, enlace_url: e.target.value })}
                placeholder="Ej: /inventario?tab=prestamos o /mantenimientos"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => cambiarPestaña('todas')}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviandoForm}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
              >
                {enviandoForm ? 'Publicando...' : 'Publicar Comunicado'}
              </button>
            </div>
          </form>
        </div>

      )}

    </div>
  );
};
