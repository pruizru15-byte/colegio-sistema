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
import { Link } from 'react-router-dom';
import { 
  Wrench, Plus, Search, Filter, Clock, CheckCircle2, 
  AlertTriangle, Calendar, User, DollarSign, X, Check, 
  ArrowRight, FileText, Printer, ShieldAlert, Laptop, Eye, 
  Activity, Sparkles, ChevronRight
} from 'lucide-react';
import { 
  getMantenimientosApi, createMantenimientoApi, 
  updateMantenimientoApi, deleteMantenimientoApi, getEquiposApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Mantenimientos = () => {
  const { isAdmin } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalNuevaOrden, setModalNuevaOrden] = useState(false);
  const [modalSeguimiento, setModalSeguimiento] = useState(null);
  const [modalConcluir, setModalConcluir] = useState(null);

  // Formulario Crear
  const [formCrear, setFormCrear] = useState({
    equipo_id: '',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    fecha_programada: new Date().toISOString().split('T')[0],
    tecnico_responsable: 'Ing. Roberto Paz',
    costo_estimado: 50.0,
    descripcion_problema: '',
  });

  // Formulario Concluir / Diagnóstico
  const [formConcluir, setFormConcluir] = useState({
    diagnostico_solucion: '',
    piezas_reemplazadas: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [mantenimientosData, equiposData] = await Promise.all([
        getMantenimientosApi({
          estado: filtroEstado || undefined,
          tipo: filtroTipo || undefined,
          prioridad: filtroPrioridad || undefined,
          busqueda: busqueda || undefined,
        }),
        getEquiposApi(),
      ]);
      setOrdenes(mantenimientosData);
      setEquipos(equiposData);
      if (equiposData.length > 0 && !formCrear.equipo_id) {
        setFormCrear((prev) => ({ ...prev, equipo_id: equiposData[0].id }));
      }
    } catch (err) {
      console.error('Error cargando órdenes de mantenimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroTipo, filtroPrioridad, busqueda]);

  const handleCrearOrden = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await createMantenimientoApi({
        ...formCrear,
        equipo_id: Number(formCrear.equipo_id),
        costo_estimado: Number(formCrear.costo_estimado) || 0.0,
      });
      setModalNuevaOrden(false);
      setFormCrear({
        equipo_id: equipos[0]?.id || '',
        tipo: 'preventivo',
        prioridad: 'media',
        estado: 'programado',
        fecha_programada: new Date().toISOString().split('T')[0],
        tecnico_responsable: 'Ing. Roberto Paz',
        costo_estimado: 50.0,
        descripcion_problema: '',
      });
      showToast('¡Orden de mantenimiento generada con éxito!');
      cargarDatos();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al generar la orden.');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar estado a "en_proceso"
  const handleIniciarMantenimiento = async (id) => {
    try {
      await updateMantenimientoApi(id, { estado: 'en_proceso' });
      showToast('Orden actualizada a: En Proceso de Reparación');
      cargarDatos();
      if (modalSeguimiento?.id === id) {
        setModalSeguimiento((prev) => ({ ...prev, estado: 'en_proceso' }));
      }
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  // Concluir orden con diagnóstico
  const handleFinalizarMantenimiento = async (e) => {
    e.preventDefault();
    if (!modalConcluir) return;
    setSaving(true);
    try {
      await updateMantenimientoApi(modalConcluir.id, {
        estado: 'completado',
        diagnostico_solucion: formConcluir.diagnostico_solucion,
        piezas_reemplazadas: formConcluir.piezas_reemplazadas,
      });
      setModalConcluir(null);
      setFormConcluir({ diagnostico_solucion: '', piezas_reemplazadas: '' });
      showToast('¡Mantenimiento concluido! El equipo volvió a estar Operativo.');
      cargarDatos();
      if (modalSeguimiento?.id === modalConcluir.id) {
        setModalSeguimiento(null);
      }
    } catch (err) {
      alert('Error al concluir orden');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarOrden = async (id, codigo) => {
    if (confirm(`¿Estás seguro de cancelar y eliminar la orden ${codigo}?`)) {
      try {
        await deleteMantenimientoApi(id);
        showToast('Orden eliminada correctamente.');
        cargarDatos();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  // Métricas superiores dinámicas
  const totalOrdenes = ordenes.length;
  const countProgramados = ordenes.filter((o) => o.estado === 'programado').length;
  const countEnProceso = ordenes.filter((o) => o.estado === 'en_proceso').length;
  const countCompletados = ordenes.filter((o) => o.estado === 'completado').length;
  const totalCosto = ordenes.reduce((acc, curr) => acc + (curr.costo_estimado || 0), 0);

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Programado
          </span>
        );
      case 'en_proceso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-0.5"></span>
            En Proceso
          </span>
        );
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {estado}
          </span>
        );
    }
  };

  const getPrioridadBadge = (prio) => {
    switch (prio?.toLowerCase()) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">Media</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Baja</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión y Seguimiento de Mantenimientos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de órdenes de servicio técnico, trazabilidad de piezas y estados de reparación
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => { setModalNuevaOrden(true); setErrorMsg(''); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow text-xs transition duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden de Mantenimiento</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Resumen Superior del Módulo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Total Órdenes</span>
          </div>
          <div className="text-xl font-black text-slate-900">{totalOrdenes}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Programados</span>
          </div>
          <div className="text-xl font-black text-blue-600">{countProgramados}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">En Reparación</span>
          </div>
          <div className="text-xl font-black text-amber-600">{countEnProceso}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Completados</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{countCompletados}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Inversión Est.</span>
          </div>
          <div className="text-xl font-black text-slate-900">S/ {totalCosto.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs Rápidos de Estado */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFiltroEstado('')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filtroEstado === '' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todas las Órdenes ({totalOrdenes})
        </button>
        <button
          onClick={() => setFiltroEstado('programado')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filtroEstado === 'programado' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Programados ({countProgramados})
        </button>
        <button
          onClick={() => setFiltroEstado('en_proceso')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filtroEstado === 'en_proceso' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          En Proceso ({countEnProceso})
        </button>
        <button
          onClick={() => setFiltroEstado('completado')}
          className={`px-3 py-1.5 rounded-xl transition ${
            filtroEstado === 'completado' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completados ({countCompletados})
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por código de orden, técnico o problema..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
          >
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="calibracion">Calibración</option>
            <option value="limpieza">Limpieza de Hardware</option>
          </select>
        </div>

        <div>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
          >
            <option value="">Todas las prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla de Órdenes de Mantenimiento con Seguimiento */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Cargando órdenes de servicio...</div>
        ) : ordenes.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No se encontraron registros de mantenimiento con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Cód. Orden</th>
                  <th className="py-3.5 px-4">Equipo Asociado</th>
                  <th className="py-3.5 px-4">Tipo & Prioridad</th>
                  <th className="py-3.5 px-4">Técnico a Cargo</th>
                  <th className="py-3.5 px-4">Fecha Prog.</th>
                  <th className="py-3.5 px-4">Estado Seguimiento</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenes.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {ord.codigo_orden}
                    </td>

                    {/* Equipo */}
                    <td className="py-3.5 px-4">
                      {ord.equipo ? (
                        <div>
                          <div className="font-bold text-slate-900">{ord.equipo.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ord.equipo.codigo_patrimonial} • {ord.equipo.ubicacion?.nombre || 'Sin aula'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Equipo #{ord.equipo_id}</span>
                      )}
                    </td>

                    {/* Tipo y Prioridad */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 capitalize font-medium text-slate-700">
                        <span>{ord.tipo}</span>
                        {getPrioridadBadge(ord.prioridad)}
                      </div>
                    </td>

                    {/* Técnico */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.tecnico_responsable}</span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {ord.fecha_programada}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      {getEstadoBadge(ord.estado)}
                    </td>

                    {/* Acciones de Seguimiento */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setModalSeguimiento(ord)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                        title="Ver línea de tiempo y trazabilidad"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Seguimiento</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleEliminarOrden(ord.id, ord.codigo_orden)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar orden"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE SEGUIMIENTO DETALLADO (Línea de tiempo / Stepper) */}
      {modalSeguimiento && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalSeguimiento(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera de la Orden */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Seguimiento de Orden</h2>
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {modalSeguimiento.codigo_orden}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Equipo: {modalSeguimiento.equipo?.nombre} ({modalSeguimiento.equipo?.codigo_patrimonial})
                </p>
              </div>
            </div>

            {/* LINEA DE TIEMPO / STEPPER DE SEGUIMIENTO */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                Progreso del Servicio Técnico
              </h3>

              <div className="relative flex justify-between items-center text-center">
                {/* Línea conectora */}
                <div className="absolute top-4 left-8 right-8 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: modalSeguimiento.estado === 'completado' ? '100%' : modalSeguimiento.estado === 'en_proceso' ? '50%' : '15%',
                    }}
                  ></div>
                </div>

                {/* Paso 1: Programado */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow">
                    1
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Programada</span>
                  <span className="text-[10px] text-slate-400 font-mono">{modalSeguimiento.fecha_programada}</span>
                </div>

                {/* Paso 2: En Proceso */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow transition ${
                    modalSeguimiento.estado === 'en_proceso' || modalSeguimiento.estado === 'completado'
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">En Reparación</span>
                  <span className="text-[10px] text-slate-400">Taller / Lab</span>
                </div>

                {/* Paso 3: Completado */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow transition ${
                    modalSeguimiento.estado === 'completado'
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-2">Completada</span>
                  <span className="text-[10px] text-slate-400">Verificado</span>
                </div>
              </div>
            </div>

            {/* Detalles Técnicos y Diagnóstico */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Técnico Asignado</div>
                  <div className="font-bold text-slate-800 mt-0.5">{modalSeguimiento.tecnico_responsable}</div>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Costo Estimado</div>
                  <div className="font-bold text-slate-800 mt-0.5">S/ {(modalSeguimiento.costo_estimado || 0).toFixed(2)}</div>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Prioridad</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">{modalSeguimiento.prioridad}</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción del Problema / Motivo:</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                  {modalSeguimiento.descripcion_problema}
                </div>
              </div>

              {modalSeguimiento.diagnostico_solucion && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diagnóstico y Solución Aplicada:</label>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed font-medium">
                    {modalSeguimiento.diagnostico_solucion}
                  </div>
                </div>
              )}

              {modalSeguimiento.piezas_reemplazadas && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Piezas / Repuestos Sustituidos:</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-mono">
                    {modalSeguimiento.piezas_reemplazadas}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción de Avance de Estado */}
            <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir Orden
              </button>

              <div className="flex gap-2">
                {modalSeguimiento.estado === 'programado' && (
                  <button
                    onClick={() => handleIniciarMantenimiento(modalSeguimiento.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <Activity className="w-4 h-4" /> Iniciar Reparación
                  </button>
                )}

                {modalSeguimiento.estado === 'en_proceso' && (
                  <button
                    onClick={() => setModalConcluir(modalSeguimiento)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Marcar como Completado
                  </button>
                )}

                <button
                  onClick={() => setModalSeguimiento(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CONCLUIR MANTENIMIENTO */}
      {modalConcluir && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-fade-in">
            <button
              onClick={() => setModalConcluir(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Concluir Mantenimiento</h3>
                <p className="text-[11px] text-slate-400">Orden {modalConcluir.codigo_orden}</p>
              </div>
            </div>

            <form onSubmit={handleFinalizarMantenimiento} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnóstico y Solución Aplicada <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detalla la reparación realizada, pruebas técnicas ejecutadas..."
                  value={formConcluir.diagnostico_solucion}
                  onChange={(e) => setFormConcluir({ ...formConcluir, diagnostico_solucion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Piezas o Repuestos Reemplazados (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cable HDMI 5m, Fuente de poder 500W..."
                  value={formConcluir.piezas_reemplazadas}
                  onChange={(e) => setFormConcluir({ ...formConcluir, piezas_reemplazadas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-blue-700 text-[11px] leading-tight">
                Al guardar, el equipo vinculado volverá automáticamente al estado <strong>Operativo</strong> en el inventario escolar.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalConcluir(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  {saving ? 'Guardando...' : 'Finalizar y Entregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA ORDEN DE MANTENIMIENTO */}
      {modalNuevaOrden && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalNuevaOrden(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Nueva Orden de Mantenimiento</h3>
                <p className="text-[11px] text-slate-400">Registra un servicio preventivo o correctivo</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCrearOrden} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Equipo a Intervenir <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formCrear.equipo_id}
                  onChange={(e) => setFormCrear({ ...formCrear, equipo_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.codigo_patrimonial} — {eq.nombre} ({eq.ubicacion?.nombre || 'Sin aula'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Servicio</label>
                  <select
                    value={formCrear.tipo}
                    onChange={(e) => setFormCrear({ ...formCrear, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="calibracion">Calibración</option>
                    <option value="limpieza">Limpieza de Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nivel de Prioridad</label>
                  <select
                    value={formCrear.prioridad}
                    onChange={(e) => setFormCrear({ ...formCrear, prioridad: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Técnico Responsable</label>
                  <input
                    type="text"
                    required
                    value={formCrear.tecnico_responsable}
                    onChange={(e) => setFormCrear({ ...formCrear, tecnico_responsable: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    required
                    value={formCrear.fecha_programada}
                    onChange={(e) => setFormCrear({ ...formCrear, fecha_programada: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Costo Estimado (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formCrear.costo_estimado}
                  onChange={(e) => setFormCrear({ ...formCrear, costo_estimado: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción del Problema o Tarea <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe la falla observada, solicitud del docente o tareas preventivas..."
                  value={formCrear.descripcion_problema}
                  onChange={(e) => setFormCrear({ ...formCrear, descripcion_problema: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevaOrden(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow"
                >
                  {saving ? 'Creando Orden...' : 'Generar Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
