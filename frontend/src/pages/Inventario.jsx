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
import { useAuth } from '../context/AuthContext';
import { 
  getEquiposApi, getEquiposStatsApi, getEquipoHistorialApi, 
  createEquipoApi, updateEquipoApi, deleteEquipoApi, 
  getUbicacionesApi, getUsuariosApi, getPrestamosApi, 
  createPrestamoApi, devolverPrestamoApi, API_BASE_URL 
} from '../services/api';
import { 
  Search, Filter, QrCode, Edit2, Trash2, MapPin, 
  CheckCircle, AlertTriangle, XCircle, Printer, X, ExternalLink, Plus,
  Layers, LayoutGrid, List, Download, ArrowRight, ShieldCheck,
  Clock, RefreshCw, User, Laptop, Monitor, Sparkles, Building2,
  FileText, History, ArrowUpRight, CheckCircle2, ChevronRight,
  TrendingUp, BarChart3, HelpCircle, Archive, Box, Share2, AlertCircle
} from 'lucide-react';

export const Inventario = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pestañas del módulo: 'catalogo' | 'estados' | 'nuevo' | 'prestamos' | 'estadisticas'
  const [tabActiva, setTabActiva] = useState(() => searchParams.get('tab') || 'catalogo');

  // Modo de visualización en catálogo: 'tabla' | 'cuadricula'
  const [vistaModo, setVistaModo] = useState('tabla');

  // Datos principales
  const [equipos, setEquipos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros de búsqueda en catálogo
  const [busqueda, setBusqueda] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrestamoEstado, setFiltroPrestamoEstado] = useState('todos');

  // Modales
  const [qrModalEquipo, setQrModalEquipo] = useState(null);
  const [historialModalEquipo, setHistorialModalEquipo] = useState(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [datosHistorial, setDatosHistorial] = useState(null);

  // Modal Cambio Rápido de Estado ("estrados")
  const [cambioEstadoModal, setCambioEstadoModal] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('operativo');
  const [observacionEstado, setObservacionEstado] = useState('');
  const [savingEstado, setSavingEstado] = useState(false);

  // Modal Préstamo Rápido
  const [prestamoRapidoModal, setPrestamoRapidoModal] = useState(null);
  const [prestamoForm, setPrestamoForm] = useState({
    usuario_id: '',
    ubicacion_id: '',
    fecha_devolucion_esperada: '',
    motivo: '',
  });
  const [savingPrestamo, setSavingPrestamo] = useState(false);

  // Modal Edición Completa
  const [editEquipo, setEditEquipo] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: '',
    ubicacion_id: '',
    observaciones: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Formulario de Registro Rápido (Pestaña "nuevo")
  const [nuevoForm, setNuevoForm] = useState({
    codigo_patrimonial: '',
    nombre: '',
    tipo: 'Computadora de Escritorio',
    marca: '',
    modelo: '',
    numero_serie: '',
    estado: 'operativo',
    ubicacion_id: '',
    observaciones: '',
  });
  const [creandoEquipo, setCreandoEquipo] = useState(false);
  const [equipoRecienCreado, setEquipoRecienCreado] = useState(null);
  const [errorNuevo, setErrorNuevo] = useState('');

  // Sincronizar parámetro URL si cambia pestaña
  const cambiarPestaña = (tab) => {
    setTabActiva(tab);
    setSearchParams({ tab });
  };

  // Cargar todos los datos del inventario escolar
  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [equiposData, ubicacionesData, usuariosData, statsData, prestamosData] = await Promise.all([
        getEquiposApi(),
        getUbicacionesApi().catch(() => []),
        getUsuariosApi().catch(() => []),
        getEquiposStatsApi().catch(() => null),
        getPrestamosApi().catch(() => []),
      ]);

      setEquipos(equiposData || []);
      setUbicaciones(ubicacionesData || []);
      setUsuarios(usuariosData || []);
      setStats(statsData);
      setPrestamos(prestamosData || []);

      if (ubicacionesData && ubicacionesData.length > 0 && !nuevoForm.ubicacion_id) {
        setNuevoForm(prev => ({ ...prev, ubicacion_id: ubicacionesData[0].id }));
      }
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // Sincronizar pestaña si cambia el parámetro de búsqueda en URL (?tab=...)
  useEffect(() => {
    const tabUrl = searchParams.get('tab');
    if (tabUrl && tabUrl !== tabActiva) {
      setTabActiva(tabUrl);
    }
  }, [searchParams]);

  // Generador de código patrimonial automático escolar
  const handleAutoGenerarCodigo = () => {
    const prefijos = {
      'Computadora de Escritorio': 'PC',
      'Laptop': 'LAP',
      'Proyector Multimedia': 'PROY',
      'Tablet Educativa': 'TAB',
      'Impresora': 'IMP',
      'Pantalla Interactiva': 'PAN',
      'Switch / Red': 'RED',
    };
    const pref = prefijos[nuevoForm.tipo] || 'EQ';
    const num = Math.floor(100 + Math.random() * 900);
    setNuevoForm(prev => ({ ...prev, codigo_patrimonial: `QR-COL-${pref}-${num}` }));
  };

  // Guardar nuevo equipo desde la pestaña integrada
  const handleRegistrarEquipo = async (e) => {
    e.preventDefault();
    setErrorNuevo('');
    setCreandoEquipo(true);
    try {
      const payload = {
        ...nuevoForm,
        ubicacion_id: nuevoForm.ubicacion_id ? Number(nuevoForm.ubicacion_id) : null,
      };
      const res = await createEquipoApi(payload);
      setEquipoRecienCreado(res);
      fetchDatos();
    } catch (err) {
      setErrorNuevo(err.response?.data?.detail || 'No se pudo registrar el equipo. Verifica que el código patrimonial no esté repetido.');
    } finally {
      setCreandoEquipo(false);
    }
  };

  // Abrir Hoja de Vida / Historial
  const handleAbrirHistorial = async (equipo) => {
    setHistorialModalEquipo(equipo);
    setLoadingHistorial(true);
    try {
      const data = await getEquipoHistorialApi(equipo.id);
      setDatosHistorial(data);
    } catch (err) {
      console.error('Error al cargar historial del equipo:', err);
      setDatosHistorial({
        ...equipo,
        mantenimientos: [],
        prestamos: [],
      });
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Abrir Modal de Cambio Rápido de Estado
  const handleAbrirCambioEstado = (equipo) => {
    setCambioEstadoModal(equipo);
    setNuevoEstadoSeleccionado(equipo.estado || 'operativo');
    setObservacionEstado(equipo.observaciones || '');
  };

  // Guardar Cambio de Estado
  const handleGuardarCambioEstado = async (e) => {
    e.preventDefault();
    if (!cambioEstadoModal) return;
    setSavingEstado(true);
    try {
      await updateEquipoApi(cambioEstadoModal.id, {
        estado: nuevoEstadoSeleccionado,
        observaciones: observacionEstado,
      });
      setCambioEstadoModal(null);
      fetchDatos();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al cambiar el estado del equipo');
    } finally {
      setSavingEstado(false);
    }
  };

  // Abrir Préstamo Rápido para un equipo
  const handleAbrirPrestamoRapido = (equipo) => {
    setPrestamoRapidoModal(equipo);
    setPrestamoForm({
      usuario_id: usuarios.length > 0 ? usuarios[0].id : '',
      ubicacion_id: equipo.ubicacion_id || (ubicaciones.length > 0 ? ubicaciones[0].id : ''),
      fecha_devolucion_esperada: '',
      motivo: `Uso pedagógico de ${equipo.nombre}`,
    });
  };

  // Guardar Préstamo Rápido
  const handleGuardarPrestamoRapido = async (e) => {
    e.preventDefault();
    if (!prestamoRapidoModal) return;
    setSavingPrestamo(true);
    try {
      await createPrestamoApi({
        equipo_id: prestamoRapidoModal.id,
        usuario_id: Number(prestamoForm.usuario_id),
        ubicacion_id: Number(prestamoForm.ubicacion_id),
        fecha_devolucion_esperada: prestamoForm.fecha_devolucion_esperada || null,
        motivo: prestamoForm.motivo,
      });
      // Actualizar estado del equipo a prestado
      await updateEquipoApi(prestamoRapidoModal.id, { estado: 'prestado' });
      setPrestamoRapidoModal(null);
      fetchDatos();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al registrar el préstamo del equipo.');
    } finally {
      setSavingPrestamo(false);
    }
  };

  // Devolver Préstamo
  const handleDevolverPrestamo = async (prestamoId, equipoId) => {
    if (confirm('¿Confirmas la recepción y devolución de este equipo a su ubicación escolar?')) {
      try {
        await devolverPrestamoApi(prestamoId);
        if (equipoId) {
          await updateEquipoApi(equipoId, { estado: 'operativo' });
        }
        fetchDatos();
      } catch (err) {
        alert(err.response?.data?.detail || 'Error al registrar la devolución.');
      }
    }
  };

  // Abrir Edición Completa
  const handleOpenEdit = (equipo) => {
    setEditEquipo(equipo);
    setEditForm({
      nombre: equipo.nombre || '',
      tipo: equipo.tipo || '',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      numero_serie: equipo.numero_serie || '',
      estado: equipo.estado || 'operativo',
      ubicacion_id: equipo.ubicacion_id || '',
      observaciones: equipo.observaciones || '',
    });
  };

  // Guardar Edición Completa
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEquipo) return;
    setSavingEdit(true);
    try {
      await updateEquipoApi(editEquipo.id, {
        ...editForm,
        ubicacion_id: editForm.ubicacion_id ? Number(editForm.ubicacion_id) : null,
      });
      setEditEquipo(null);
      fetchDatos();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al actualizar el equipo');
    } finally {
      setSavingEdit(false);
    }
  };

  // Eliminar equipo
  const handleDelete = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar el equipo "${nombre}"? Esta acción borrará también su código QR y trazabilidad.`)) {
      try {
        await deleteEquipoApi(id);
        fetchDatos();
      } catch (err) {
        alert(err.response?.data?.detail || 'Error al eliminar');
      }
    }
  };

  // Exportar a archivo CSV estructurado
  const handleExportarCSV = () => {
    if (equiposFiltrados.length === 0) {
      alert('No hay equipos para exportar');
      return;
    }
    const headers = ['ID', 'Código Patrimonial', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Nº Serie', 'Estado', 'Ubicación', 'Hash QR', 'Observaciones'];
    const rows = equiposFiltrados.map(eq => [
      eq.id,
      `"${eq.codigo_patrimonial || ''}"`,
      `"${(eq.nombre || '').replace(/"/g, '""')}"`,
      `"${eq.tipo || ''}"`,
      `"${eq.marca || ''}"`,
      `"${eq.modelo || ''}"`,
      `"${eq.numero_serie || ''}"`,
      `"${eq.estado || ''}"`,
      `"${eq.ubicacion ? eq.ubicacion.nombre : 'Sin asignar'}"`,
      `"${eq.codigo_qr ? eq.codigo_qr.codigo_hash : ''}"`,
      `"${(eq.observaciones || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_equipos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Badge de Estado Institucional
  const getEstadoBadge = (estado) => {
    const st = (estado || 'operativo').toLowerCase();
    switch (st) {
      case 'operativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Operativo
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> En Mantenimiento
          </span>
        );
      case 'prestado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Share2 className="w-3 h-3 text-sky-600" /> En Préstamo
          </span>
        );
      case 'en_reserva':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Archive className="w-3 h-3 text-purple-600" /> En Reserva
          </span>
        );
      case 'de_baja':
      case 'desuso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> De Baja
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 capitalize">
            {estado}
          </span>
        );
    }
  };

  // Conteo de métricas calculadas
  const metricas = useMemo(() => {
    const total = equipos.length;
    const operativos = equipos.filter(e => e.estado === 'operativo').length;
    const mantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
    const prestados = equipos.filter(e => e.estado === 'prestado').length;
    const enReserva = equipos.filter(e => e.estado === 'en_reserva').length;
    const deBaja = equipos.filter(e => e.estado === 'de_baja' || e.estado === 'desuso').length;
    const pctOperativo = total > 0 ? Math.round((operativos / total) * 100) : 100;
    return { total, operativos, mantenimiento, prestados, enReserva, deBaja, pctOperativo };
  }, [equipos]);

  // Filtrado de equipos
  const equiposFiltrados = useMemo(() => {
    return equipos.filter((eq) => {
      if (filtroEstado !== 'todos') {
        if (filtroEstado === 'de_baja') {
          if (eq.estado !== 'de_baja' && eq.estado !== 'desuso') return false;
        } else if (eq.estado !== filtroEstado) {
          return false;
        }
      }
      if (filtroTipo !== 'todos' && eq.tipo !== filtroTipo) {
        return false;
      }
      if (filtroUbicacion && String(eq.ubicacion_id) !== String(filtroUbicacion)) {
        return false;
      }
      if (busqueda.trim()) {
        const t = busqueda.toLowerCase();
        const mCod = eq.codigo_patrimonial?.toLowerCase().includes(t);
        const mNom = eq.nombre?.toLowerCase().includes(t);
        const mSer = eq.numero_serie?.toLowerCase().includes(t);
        const mMar = eq.marca?.toLowerCase().includes(t);
        const mMod = eq.modelo?.toLowerCase().includes(t);
        if (!mCod && !mNom && !mSer && !mMar && !mMod) return false;
      }
      return true;
    });
  }, [equipos, filtroEstado, filtroTipo, filtroUbicacion, busqueda]);

  // Lista de tipos únicos de equipos presentes en la base de datos
  const tiposDisponibles = useMemo(() => {
    const setTipos = new Set(equipos.map(e => e.tipo).filter(Boolean));
    return Array.from(setTipos);
  }, [equipos]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Encabezado del Módulo con Acciones Principales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Control de Patrimonio Escolar
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Actualizado en tiempo real
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Gestión Integral de Equipos</span>
          </h1>
          <p className="text-xs text-slate-500">
            Administración de bienes tecnológicos, estados operativos, trazabilidad de préstamos y rótulos QR.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDatos}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportarCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Exportar CSV
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Imprimir
          </button>

          <button
            onClick={() => cambiarPestaña('nuevo')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Equipo
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Superiores de Métricas y Estados ("estrados") */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
        
        <div 
          onClick={() => { cambiarPestaña('catalogo'); setFiltroEstado('todos'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Bienes</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metricas.total}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">100% con rótulo QR</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('catalogo'); setFiltroEstado('operativo'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operativos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{metricas.operativos}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{metricas.pctOperativo}% en servicio activo</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('catalogo'); setFiltroEstado('mantenimiento'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-amber-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mantenimiento</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{metricas.mantenimiento}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">En taller o revisión</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('prestamos'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-sky-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">En Préstamo</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600">{metricas.prestados}</div>
          <div className="text-[10px] text-sky-700 font-semibold mt-0.5">Asignados a docentes</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('catalogo'); setFiltroEstado('en_reserva'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-purple-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">En Reserva</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Archive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600">{metricas.enReserva}</div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Stock en almacén</div>
        </div>

        <div 
          onClick={() => { cambiarPestaña('catalogo'); setFiltroEstado('de_baja'); }}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-rose-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">De Baja</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{metricas.deBaja}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">Desuso o daño total</div>
        </div>

      </div>

      {/* 3. Barra de Navegación por Pestañas (Tabs) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => cambiarPestaña('catalogo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'catalogo'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Catálogo General ({equipos.length})
          </button>

          <button
            onClick={() => cambiarPestaña('estados')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'estados'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            Monitor por Estados
          </button>

          <button
            onClick={() => cambiarPestaña('nuevo')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'nuevo'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Equipo
          </button>

          <button
            onClick={() => cambiarPestaña('prestamos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'prestamos'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Control de Préstamos ({prestamos.length})
          </button>

          <button
            onClick={() => cambiarPestaña('estadisticas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              tabActiva === 'estadisticas'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas y Análisis
          </button>
        </div>

        {/* Selector de Vista (Tabla vs Tarjetas) si está en la pestaña catálogo */}
        {tabActiva === 'catalogo' && (
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setVistaModo('tabla')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                vistaModo === 'tabla'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Tabla Detallada"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setVistaModo('cuadricula')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                vistaModo === 'cuadricula'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Tarjetas Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          PESTAÑA 1: CATÁLOGO GENERAL DE EQUIPOS
          ======================================================== */}
      {tabActiva === 'catalogo' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros Rápidos */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, serie, marca..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <div>
              <select
                value={filtroUbicacion}
                onChange={(e) => setFiltroUbicacion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="">Todas las ubicaciones escolares</option>
                {ubicaciones.map((ub) => (
                  <option key={ub.id} value={ub.id}>
                    {ub.nombre} ({ub.pabellon || 'Sede'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los tipos de equipos</option>
                {tiposDisponibles.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 font-bold"
              >
                <option value="todos">Todos los estados</option>
                <option value="operativo">🟢 Operativos</option>
                <option value="mantenimiento">🟡 En Mantenimiento</option>
                <option value="prestado">🔵 En Préstamo</option>
                <option value="en_reserva">🟣 En Reserva</option>
                <option value="de_baja">🔴 De Baja / Desuso</option>
              </select>
            </div>

          </div>

          {/* Estado de carga */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Cargando inventario escolar...</p>
            </div>
          ) : equiposFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Box className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No se encontraron equipos</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hay coincidencias con los filtros aplicados. Prueba borrando los términos de búsqueda o registrando un nuevo equipo.
              </p>
            </div>
          ) : vistaModo === 'tabla' ? (

            /* TABLA DETALLADA */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Cód. Patrimonial</th>
                      <th className="py-3 px-4">Equipo / Marca</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Ubicación Actual</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Código QR</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {equiposFiltrados.map((eq) => (
                      <tr key={eq.id} className="hover:bg-slate-50/80 transition">
                        
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {eq.codigo_patrimonial}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{eq.nombre}</div>
                          <div className="text-[11px] text-slate-400">
                            {eq.marca || 'Genérico'} {eq.modelo} • S/N: {eq.numero_serie || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                            {eq.tipo}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {eq.ubicacion ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span>{eq.ubicacion.nombre}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sin asignar</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {getEstadoBadge(eq.estado)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {eq.codigo_qr && (
                            <button
                              onClick={() => setQrModalEquipo(eq)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg transition"
                              title="Ver y descargar rótulo QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Rótulo</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Botón Hoja de Vida */}
                          <button
                            onClick={() => handleAbrirHistorial(eq)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Hoja de Vida y Trazabilidad del Equipo"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Botón Cambio Rápido de Estado */}
                          <button
                            onClick={() => handleAbrirCambioEstado(eq)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Cambiar Estado Operativo"
                          >
                            <Box className="w-4 h-4" />
                          </button>

                          {/* Botón Préstamo Rápido si está operativo */}
                          {(eq.estado === 'operativo' || eq.estado === 'en_reserva') && (
                            <button
                              onClick={() => handleAbrirPrestamoRapido(eq)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                              title="Registrar Préstamo de este equipo"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Botón Edición Completa */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(eq)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Editar datos del equipo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Botón Eliminar */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(eq.id, eq.nombre)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Eliminar equipo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          ) : (

            /* CUADRÍCULA DE TARJETAS (CARDS) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equiposFiltrados.map((eq) => (
                <div 
                  key={eq.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {eq.codigo_patrimonial}
                      </span>
                      {getEstadoBadge(eq.estado)}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                      {eq.nombre}
                    </h3>

                    <div className="text-[11px] text-slate-500 mb-3 space-y-1">
                      <div>
                        <span className="text-slate-400">Tipo:</span> <span className="font-medium text-slate-700">{eq.tipo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Marca/Modelo:</span> <span className="font-medium text-slate-700">{eq.marca || '-'} {eq.modelo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{eq.ubicacion?.nombre || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setQrModalEquipo(eq)}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Rótulo QR
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAbrirHistorial(eq)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                        title="Hoja de Vida"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition"
                        title="Cambiar Estado"
                      >
                        <Box className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          )}

        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: MONITOR POR ESTADOS ("ESTRADOS")
          ======================================================== */}
      {tabActiva === 'estados' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/70 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-600" />
              <span className="font-bold">Tablero de Control por Estados Físicos y Operativos</span>
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">
              Cambia el estado de cualquier equipo con 1 clic para actualizar su disponibilidad escolar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Columna 1: Operativos */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Operativos
                </div>
                <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {equipos.filter(e => e.estado === 'operativo').length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {equipos.filter(e => e.estado === 'operativo').map(eq => (
                  <div key={eq.id} className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60 text-xs space-y-1.5 hover:shadow-2xs transition">
                    <div className="font-mono font-bold text-[11px] text-emerald-700">{eq.codigo_patrimonial}</div>
                    <div className="font-bold text-slate-800 leading-tight">{eq.nombre}</div>
                    <div className="text-[10px] text-slate-500">📍 {eq.ubicacion?.nombre || 'Sin aula'}</div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs"
                      >
                        Cambiar Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: En Mantenimiento */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Mantenimiento
                </div>
                <span className="text-[11px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {equipos.filter(e => e.estado === 'mantenimiento').length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {equipos.filter(e => e.estado === 'mantenimiento').map(eq => (
                  <div key={eq.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 text-xs space-y-1.5 hover:shadow-2xs transition">
                    <div className="font-mono font-bold text-[11px] text-amber-700">{eq.codigo_patrimonial}</div>
                    <div className="font-bold text-slate-800 leading-tight">{eq.nombre}</div>
                    <div className="text-[10px] text-slate-500">📍 {eq.ubicacion?.nombre || 'Taller de cómputo'}</div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold bg-white px-2 py-1 rounded-md border border-amber-200 shadow-2xs"
                      >
                        Cambiar Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 3: En Préstamo */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-sky-800">
                  <Share2 className="w-4 h-4 text-sky-600" />
                  En Préstamo
                </div>
                <span className="text-[11px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                  {equipos.filter(e => e.estado === 'prestado').length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {equipos.filter(e => e.estado === 'prestado').map(eq => (
                  <div key={eq.id} className="p-3 bg-sky-50/40 rounded-xl border border-sky-200/60 text-xs space-y-1.5 hover:shadow-2xs transition">
                    <div className="font-mono font-bold text-[11px] text-sky-700">{eq.codigo_patrimonial}</div>
                    <div className="font-bold text-slate-800 leading-tight">{eq.nombre}</div>
                    <div className="text-[10px] text-slate-500">📍 Asignado temporalmente</div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="text-[10px] text-sky-700 hover:text-sky-900 font-bold bg-white px-2 py-1 rounded-md border border-sky-200 shadow-2xs"
                      >
                        Cambiar Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 4: En Reserva */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-800">
                  <Archive className="w-4 h-4 text-purple-600" />
                  En Reserva
                </div>
                <span className="text-[11px] font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {equipos.filter(e => e.estado === 'en_reserva').length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {equipos.filter(e => e.estado === 'en_reserva').map(eq => (
                  <div key={eq.id} className="p-3 bg-purple-50/40 rounded-xl border border-purple-200/60 text-xs space-y-1.5 hover:shadow-2xs transition">
                    <div className="font-mono font-bold text-[11px] text-purple-700">{eq.codigo_patrimonial}</div>
                    <div className="font-bold text-slate-800 leading-tight">{eq.nombre}</div>
                    <div className="text-[10px] text-slate-500">📍 Almacén central</div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="text-[10px] text-purple-700 hover:text-purple-900 font-bold bg-white px-2 py-1 rounded-md border border-purple-200 shadow-2xs"
                      >
                        Cambiar Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 5: De Baja */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  De Baja
                </div>
                <span className="text-[11px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {equipos.filter(e => e.estado === 'de_baja' || e.estado === 'desuso').length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px] pr-1">
                {equipos.filter(e => e.estado === 'de_baja' || e.estado === 'desuso').map(eq => (
                  <div key={eq.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/60 text-xs space-y-1.5 hover:shadow-2xs transition">
                    <div className="font-mono font-bold text-[11px] text-rose-700">{eq.codigo_patrimonial}</div>
                    <div className="font-bold text-slate-800 leading-tight">{eq.nombre}</div>
                    <div className="text-[10px] text-slate-500">📍 Desincorporado</div>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => handleAbrirCambioEstado(eq)}
                        className="text-[10px] text-rose-700 hover:text-rose-900 font-bold bg-white px-2 py-1 rounded-md border border-rose-200 shadow-2xs"
                      >
                        Cambiar Estado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 3: REGISTRO INTEGRADO DE NUEVO EQUIPO
          ======================================================== */}
      {tabActiva === 'nuevo' && (
        <div className="max-w-4xl mx-auto space-y-5">
          
          {equipoRecienCreado ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">¡Equipo Registrado Exitosamente!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se ha generado su Código QR institucional y asociado al inventario del colegio.
                </p>
              </div>

              {equipoRecienCreado.codigo_qr && (
                <div className="bg-slate-50 p-6 rounded-2xl inline-block border border-slate-200">
                  <img
                    src={`${API_BASE_URL}/qr/imagen/${equipoRecienCreado.codigo_qr.codigo_hash}`}
                    alt="QR"
                    className="w-48 h-48 mx-auto"
                  />
                  <div className="font-mono font-bold text-xs text-slate-700 mt-2">
                    {equipoRecienCreado.codigo_patrimonial}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Hash: {equipoRecienCreado.codigo_qr.codigo_hash}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setEquipoRecienCreado(null);
                    setNuevoForm(prev => ({
                      ...prev,
                      codigo_patrimonial: '',
                      nombre: '',
                      numero_serie: '',
                      observaciones: '',
                    }));
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  Registrar Otro Equipo
                </button>

                <button
                  onClick={() => cambiarPestaña('catalogo')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Ver en Catálogo
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Alta de Activo Tecnológico Escolar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Completa los datos del dispositivo para emitir su rótulo QR de control patrimonial.
                </p>
              </div>

              {errorNuevo && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorNuevo}</span>
                </div>
              )}

              <form onSubmit={handleRegistrarEquipo} className="space-y-5">
                
                {/* 1. Identificación */}
                <div>
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">1. Identificación y Patrimonio</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código Patrimonial <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={nuevoForm.codigo_patrimonial}
                          onChange={(e) => setNuevoForm({ ...nuevoForm, codigo_patrimonial: e.target.value })}
                          placeholder="Ej: QR-COL-PC-015"
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/30 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAutoGenerarCodigo}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold whitespace-nowrap transition"
                          title="Generar código correlativo sugerido"
                        >
                          ⚡ Auto
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre Descriptivo del Equipo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nuevoForm.nombre}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                        placeholder="Ej: Computadora Intel Core i7 Lab Cómputo 1"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/30 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Especificaciones */}
                <div>
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">2. Clasificación y Hardware</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tipo de Dispositivo <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={nuevoForm.tipo}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, tipo: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="Computadora de Escritorio">Computadora de Escritorio</option>
                        <option value="Laptop">Laptop / Portátil</option>
                        <option value="Proyector Multimedia">Proyector Multimedia</option>
                        <option value="Tablet Educativa">Tablet Educativa</option>
                        <option value="Impresora">Impresora / Multifuncional</option>
                        <option value="Pantalla Interactiva">Pantalla Interactiva / Smart TV</option>
                        <option value="Switch / Red">Switch / Equipo de Red</option>
                        <option value="Otro">Otro Dispositivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Marca</label>
                      <input
                        type="text"
                        value={nuevoForm.marca}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, marca: e.target.value })}
                        placeholder="Ej: HP, Dell, Epson"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Modelo</label>
                      <input
                        type="text"
                        value={nuevoForm.modelo}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, modelo: e.target.value })}
                        placeholder="Ej: ProBook 450"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número de Serie (S/N)</label>
                    <input
                      type="text"
                      value={nuevoForm.numero_serie}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, numero_serie: e.target.value })}
                      placeholder="Ej: 5CD2348X99"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* 3. Ubicación y Estado Inicial */}
                <div>
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">3. Asignación y Estado</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ubicación Inicial en el Colegio <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={nuevoForm.ubicacion_id}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, ubicacion_id: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        {ubicaciones.map((ub) => (
                          <option key={ub.id} value={ub.id}>
                            {ub.nombre} ({ub.pabellon || 'Sede'}) - Piso {ub.piso || '1'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estado Físico Inicial</label>
                      <select
                        value={nuevoForm.estado}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, estado: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      >
                        <option value="operativo">🟢 Operativo (Listo para uso)</option>
                        <option value="en_reserva">🟣 En Reserva (Almacén)</option>
                        <option value="mantenimiento">🟡 En Mantenimiento (En revisión)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones Técnicas o Accesorios</label>
                    <textarea
                      rows="2"
                      value={nuevoForm.observaciones}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, observaciones: e.target.value })}
                      placeholder="Incluye cargador original, mouse inalámbrico, garantía vigente..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => cambiarPestaña('catalogo')}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creandoEquipo}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    {creandoEquipo ? 'Registrando y generando QR...' : 'Guardar y Generar Código QR'}
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          PESTAÑA 4: CONTROL DE PRÉSTAMOS Y ASIGNACIONES
          ======================================================== */}
      {tabActiva === 'prestamos' && (
        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registro de Préstamos y Trazabilidad Escolar</h3>
              <p className="text-xs text-slate-500">Supervisa qué docentes o alumnos tienen dispositivos prestados y su fecha de retorno</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroPrestamoEstado}
                onChange={(e) => setFiltroPrestamoEstado(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="todos">Todos los préstamos</option>
                <option value="activo">Solo Préstamos Activos</option>
                <option value="devuelto">Historial de Devueltos</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {prestamos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Share2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">No hay préstamos registrados actualmente en el sistema.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Cód. Préstamo</th>
                      <th className="py-3 px-4">Equipo Prestado</th>
                      <th className="py-3 px-4">Docente / Usuario</th>
                      <th className="py-3 px-4">Ubicación Destino</th>
                      <th className="py-3 px-4">Fecha Salida</th>
                      <th className="py-3 px-4">Devolución Esperada</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prestamos
                      .filter(p => filtroPrestamoEstado === 'todos' || p.estado === filtroPrestamoEstado)
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">
                            {p.codigo_prestamo}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{p.equipo?.nombre || 'Equipo escolar'}</div>
                            <div className="text-[10px] font-mono text-slate-400">{p.equipo?.codigo_patrimonial}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{p.usuario?.nombre || 'Usuario'}</div>
                            <div className="text-[10px] text-slate-400">{p.usuario?.email}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            📍 {p.ubicacion?.nombre || 'Aula asignada'}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            {p.fecha_prestamo ? new Date(p.fecha_prestamo).toLocaleDateString() : '-'}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            {p.fecha_devolucion_esperada || 'No especificada'}
                          </td>

                          <td className="py-3 px-4">
                            {p.estado === 'activo' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> Activo (En uso)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Devuelto
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {p.estado === 'activo' && (
                              <button
                                onClick={() => handleDevolverPrestamo(p.id, p.equipo_id)}
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition"
                              >
                                Registrar Devolución
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

        </div>
      )}

      {/* ========================================================
          PESTAÑA 5: ESTADÍSTICAS Y SALUD DEL INVENTARIO
          ======================================================== */}
      {tabActiva === 'estadisticas' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disponibilidad Escolar</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {metricas.pctOperativo}%
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Porcentaje de computadoras, laptops y proyectores aptos para clases presenciales e híbridas.
              </p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${metricas.pctOperativo}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa de Incidencia</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600">
                {metricas.total > 0 ? ((metricas.mantenimiento / metricas.total) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Equipos que se encuentran actualmente bajo intervención técnica preventiva o correctiva.
              </p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(metricas.mantenimiento / (metricas.total || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cobertura Código QR</span>
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-600">
                100%
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Todos los activos del colegio cuentan con rótulo físico y ficha técnica digital en la nube.
              </p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

          </div>

          {/* Distribución por Tipo de Equipo */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Distribución de Activos por Categoría Tecnológica</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiposDisponibles.map(tipo => {
                const count = equipos.filter(e => e.tipo === tipo).length;
                const pct = metricas.total > 0 ? Math.round((count / metricas.total) * 100) : 0;
                return (
                  <div key={tipo} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{tipo}</span>
                      <span className="font-mono font-bold text-xs text-blue-600">{count} unid.</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">{pct}% del parque total</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          MODALES DEL MÓDULO DE EQUIPOS
          ======================================================== */}

      {/* 1. MODAL CÓDIGO QR (Visualización / Descarga / Enlace a Ficha) */}
      {qrModalEquipo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setQrModalEquipo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-base text-slate-900">Rótulo QR del Activo</h3>
            <p className="text-xs text-slate-500 mb-4">{qrModalEquipo.nombre}</p>
            
            <div className="bg-slate-50 p-5 rounded-2xl inline-block border border-slate-200 mb-4 shadow-inner">
              <img
                src={`${API_BASE_URL}/qr/imagen/${qrModalEquipo.codigo_qr.codigo_hash}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
              <div className="font-mono text-xs font-black text-slate-900 mt-2">
                {qrModalEquipo.codigo_patrimonial}
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                HASH: {qrModalEquipo.codigo_qr.codigo_hash}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`${API_BASE_URL}/qr/imagen/${qrModalEquipo.codigo_qr.codigo_hash}`}
                download={`QR_${qrModalEquipo.codigo_patrimonial}.png`}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
              >
                <Download className="w-4 h-4" /> Bajar PNG
              </a>
              <Link
                to={`/ficha/${qrModalEquipo.codigo_qr.codigo_hash}`}
                target="_blank"
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-4 h-4" /> Ficha Digital
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL HOJA DE VIDA / HISTORIAL COMPLETO */}
      {historialModalEquipo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {historialModalEquipo.codigo_patrimonial}
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">{historialModalEquipo.nombre}</h3>
              </div>
              <button
                onClick={() => { setHistorialModalEquipo(null); setDatosHistorial(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 py-4 text-xs">
              
              {/* Resumen Técnico */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-slate-400 text-[10px]">Tipo</div>
                  <div className="font-bold text-slate-800">{historialModalEquipo.tipo}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Marca & Modelo</div>
                  <div className="font-bold text-slate-800">{historialModalEquipo.marca} {historialModalEquipo.modelo}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Nº Serie</div>
                  <div className="font-mono font-bold text-slate-800">{historialModalEquipo.numero_serie || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Estado Actual</div>
                  <div>{getEstadoBadge(historialModalEquipo.estado)}</div>
                </div>
              </div>

              {/* Trazabilidad de Mantenimientos */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Historial de Órdenes de Mantenimiento ({datosHistorial?.mantenimientos?.length || 0})
                </h4>
                
                {loadingHistorial ? (
                  <p className="text-slate-400 italic">Cargando intervenciones...</p>
                ) : !datosHistorial?.mantenimientos || datosHistorial.mantenimientos.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Este equipo no registra fallas ni reparaciones reportadas hasta la fecha.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {datosHistorial.mantenimientos.map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-blue-600">{m.codigo_orden} - {m.tipo}</div>
                          <div className="text-slate-700 font-medium mt-0.5">{m.descripcion_problema}</div>
                          {m.diagnostico_solucion && (
                            <div className="text-emerald-700 text-[11px] mt-0.5">Solución: {m.diagnostico_solucion}</div>
                          )}
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <div>📅 {m.fecha_programada}</div>
                          <div className="font-semibold text-slate-700">Técnico: {m.tecnico_responsable}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trazabilidad de Préstamos */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2.5">
                  <Share2 className="w-4 h-4 text-sky-500" />
                  Historial de Préstamos y Asignaciones ({datosHistorial?.prestamos?.length || 0})
                </h4>

                {loadingHistorial ? (
                  <p className="text-slate-400 italic">Cargando préstamos...</p>
                ) : !datosHistorial?.prestamos || datosHistorial.prestamos.length === 0 ? (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    No cuenta con préstamos temporales registrados fuera de su aula asignada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {datosHistorial.prestamos.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-mono font-bold text-sky-600">{p.codigo_prestamo}</div>
                          <div className="font-semibold text-slate-800">Prestatario: {p.usuario_nombre}</div>
                          <div className="text-[11px] text-slate-500">Motivo: {p.motivo || 'Uso académico'}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado === 'activo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {p.estado === 'activo' ? 'En Uso' : 'Devuelto'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setHistorialModalEquipo(null); setDatosHistorial(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cerrar Hoja de Vida
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. MODAL CAMBIO RÁPIDO DE ESTADO */}
      {cambioEstadoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCambioEstadoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Cambiar Estado del Activo</h3>
            <p className="text-xs text-slate-500 mb-4">{cambioEstadoModal.nombre} ({cambioEstadoModal.codigo_patrimonial})</p>

            <form onSubmit={handleGuardarCambioEstado} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nuevo Estado Operativo</label>
                <select
                  value={nuevoEstadoSeleccionado}
                  onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold bg-white"
                >
                  <option value="operativo">🟢 Operativo (Disponible para aulas)</option>
                  <option value="mantenimiento">🟡 En Mantenimiento (En reparación/taller)</option>
                  <option value="prestado">🔵 En Préstamo (En uso temporal)</option>
                  <option value="en_reserva">🟣 En Reserva (Bodega/Almacén)</option>
                  <option value="de_baja">🔴 De Baja / Desuso (Avería irreparable)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Motivo u Observaciones del Cambio</label>
                <textarea
                  rows="3"
                  value={observacionEstado}
                  onChange={(e) => setObservacionEstado(e.target.value)}
                  placeholder="Detalla el motivo del cambio de estado (ej: pantalla quebrada, reparado por técnico, etc.)..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCambioEstadoModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEstado}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  {savingEstado ? 'Actualizando...' : 'Actualizar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL PRÉSTAMO RÁPIDO */}
      {prestamoRapidoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPrestamoRapidoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Registrar Préstamo de Equipo</h3>
            <p className="text-xs text-slate-500 mb-4">{prestamoRapidoModal.nombre} ({prestamoRapidoModal.codigo_patrimonial})</p>

            <form onSubmit={handleGuardarPrestamoRapido} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Docente o Alumno Responsable</label>
                <select
                  required
                  value={prestamoForm.usuario_id}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, usuario_id: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="">Selecciona al prestatario...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.email}) - {u.rol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ubicación / Aula Destino</label>
                <select
                  required
                  value={prestamoForm.ubicacion_id}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, ubicacion_id: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  {ubicaciones.map(ub => (
                    <option key={ub.id} value={ub.id}>{ub.nombre} ({ub.pabellon || 'Sede'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha Esperada de Devolución</label>
                <input
                  type="date"
                  value={prestamoForm.fecha_devolucion_esperada}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, fecha_devolucion_esperada: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo del Préstamo</label>
                <input
                  type="text"
                  value={prestamoForm.motivo}
                  onChange={(e) => setPrestamoForm({ ...prestamoForm, motivo: e.target.value })}
                  placeholder="Ej: Clase de innovación, taller de robótica..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrestamoRapidoModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPrestamo}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow"
                >
                  {savingPrestamo ? 'Registrando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL EDICIÓN COMPLETA */}
      {editEquipo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditEquipo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base text-slate-900 mb-1">Editar Datos del Activo</h3>
            <p className="text-xs text-slate-500 mb-4">{editEquipo.nombre} ({editEquipo.codigo_patrimonial})</p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Equipo</label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={editForm.marca}
                    onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={editForm.modelo}
                    onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ubicación</label>
                  <select
                    value={editForm.ubicacion_id}
                    onChange={(e) => setEditForm({ ...editForm, ubicacion_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                  >
                    <option value="">Sin Asignar</option>
                    {ubicaciones.map((ub) => (
                      <option key={ub.id} value={ub.id}>{ub.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="operativo">Operativo</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="prestado">En Préstamo</option>
                    <option value="en_reserva">En Reserva</option>
                    <option value="de_baja">De Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows="2"
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEquipo(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
