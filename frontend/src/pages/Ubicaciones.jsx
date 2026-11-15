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
  MapPin, Plus, Search, Filter, Laptop, Users, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, CornerDownLeft, Eye, 
  Building2, Sparkles, Layers, ShieldCheck, X, RefreshCw, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

export const Ubicaciones = () => {
  const { token, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados principales
  const [ubicaciones, setUbicaciones] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pestañas: 'ambientes' o 'prestamos'
  const [tabActiva, setTabActiva] = useState(() => searchParams.get('tab') || 'ambientes');

  // Sincronizar con URL (?tab=...)
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tabActiva) {
      setTabActiva(t);
    }
  }, [searchParams]);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroEstadoPrestamo, setFiltroEstadoPrestamo] = useState('todos');

  // Modales
  const [modalUbicacionOpen, setModalUbicacionOpen] = useState(false);
  const [ubicacionEdicion, setUbicacionEdicion] = useState(null);
  const [formUbicacion, setFormUbicacion] = useState({
    nombre: '',
    pabellon: '',
    piso: '',
    responsable: ''
  });

  const [modalPrestamoOpen, setModalPrestamoOpen] = useState(false);
  const [formPrestamo, setFormPrestamo] = useState({
    equipo_id: '',
    usuario_id: '',
    ubicacion_id: '',
    fecha_devolucion_esperada: '',
    motivo: '',
    observaciones: ''
  });

  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [detalleUbicacion, setDetalleUbicacion] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const [resUb, resPr, resEq, resUs] = await Promise.all([
        fetch(`${API_BASE}/ubicaciones`, { headers }),
        fetch(`${API_BASE}/prestamos`, { headers }),
        fetch(`${API_BASE}/equipos`, { headers }),
        fetch(`${API_BASE}/usuarios`, { headers })
      ]);

      if (resUb.ok) setUbicaciones(await resUb.json());
      if (resPr.ok) setPrestamos(await resPr.json());
      if (resEq.ok) setEquipos(await resEq.json());
      if (resUs.ok) setUsuarios(await resUs.json());
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al sincronizar datos con el servidor escolar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [token]);

  // Al seleccionar un usuario en el formulario de préstamo, asignar su ubicación predeterminada
  const handleUsuarioChange = (usuarioId) => {
    const usr = usuarios.find(u => String(u.id) === String(usuarioId));
    let ubDefecto = '';
    if (usr && usr.ubicacion_defecto_id) {
      ubDefecto = String(usr.ubicacion_defecto_id);
    } else if (ubicaciones.length > 0) {
      ubDefecto = String(ubicaciones[0].id);
    }

    setFormPrestamo(prev => ({
      ...prev,
      usuario_id: usuarioId,
      ubicacion_id: ubDefecto
    }));
  };

  // Abrir modal de crear o editar ubicación
  const abrirModalUbicacion = (ub = null) => {
    if (ub) {
      setUbicacionEdicion(ub);
      setFormUbicacion({
        nombre: ub.nombre,
        pabellon: ub.pabellon || '',
        piso: ub.piso || '',
        responsable: ub.responsable || ''
      });
    } else {
      setUbicacionEdicion(null);
      setFormUbicacion({
        nombre: '',
        pabellon: '',
        piso: '',
        responsable: ''
      });
    }
    setModalUbicacionOpen(true);
  };

  // Guardar ubicación
  const handleGuardarUbicacion = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      let res;
      if (ubicacionEdicion) {
        res = await fetch(`${API_BASE}/ubicaciones/${ubicacionEdicion.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formUbicacion)
        });
      } else {
        res = await fetch(`${API_BASE}/ubicaciones`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formUbicacion)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al guardar ubicación');
      }

      setSuccessMsg(ubicacionEdicion ? 'Ubicación actualizada correctamente' : 'Nueva ubicación creada con éxito');
      setModalUbicacionOpen(false);
      cargarDatos();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Abrir modal de préstamo
  const abrirModalPrestamo = (prefillEquipoId = '') => {
    // Si hay un usuario seleccionado por defecto o el primero
    let primerUsuario = usuarios.length > 0 ? usuarios[0] : null;
    let ubId = '';
    if (primerUsuario && primerUsuario.ubicacion_defecto_id) {
      ubId = String(primerUsuario.ubicacion_defecto_id);
    } else if (ubicaciones.length > 0) {
      ubId = String(ubicaciones[0].id);
    }

    setFormPrestamo({
      equipo_id: prefillEquipoId ? String(prefillEquipoId) : '',
      usuario_id: primerUsuario ? String(primerUsuario.id) : '',
      ubicacion_id: ubId,
      fecha_devolucion_esperada: '',
      motivo: '',
      observaciones: ''
    });
    setModalPrestamoOpen(true);
  };

  // Guardar préstamo
  const handleGuardarPrestamo = async (e) => {
    e.preventDefault();
    try {
      if (!formPrestamo.equipo_id || !formPrestamo.usuario_id) {
        alert('Selecciona un equipo y el usuario prestatario.');
        return;
      }

      const res = await fetch(`${API_BASE}/prestamos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equipo_id: parseInt(formPrestamo.equipo_id),
          usuario_id: parseInt(formPrestamo.usuario_id),
          ubicacion_id: formPrestamo.ubicacion_id ? parseInt(formPrestamo.ubicacion_id) : null,
          fecha_devolucion_esperada: formPrestamo.fecha_devolucion_esperada || null,
          motivo: formPrestamo.motivo || null,
          observaciones: formPrestamo.observaciones || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al registrar préstamo');
      }

      setSuccessMsg('Préstamo asignado exitosamente y equipo ubicado en la sede del usuario.');
      setModalPrestamoOpen(false);
      cargarDatos();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Registrar Devolución de Préstamo
  const handleDevolverPrestamo = async (prestamoId) => {
    if (!window.confirm('¿Confirmas que el dispositivo ha sido devuelto a la institución educativa?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/prestamos/${prestamoId}/devolver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al devolver equipo');
      }

      setSuccessMsg('Equipo devuelto con éxito. El dispositivo volvió al estado operativo.');
      cargarDatos();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ver Detalle de Ubicación
  const handleVerDetalle = async (ubId) => {
    try {
      setCargandoDetalle(true);
      setModalDetalleOpen(true);
      const res = await fetch(`${API_BASE}/ubicaciones/${ubId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDetalleUbicacion(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Cálculo de totales para tarjetas superiores
  const totalUbicaciones = ubicaciones.length;
  const totalEquiposAlojados = equipos.length;
  const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
  const totalPrestamosActivos = prestamosActivos.length;
  const totalUsuariosAsignados = usuarios.filter(u => u.ubicacion_defecto_id != null).length;

  // Filtrado de préstamos
  const prestamosFiltrados = prestamos.filter(p => {
    if (filtroEstadoPrestamo !== 'todos' && p.estado !== filtroEstadoPrestamo) return false;
    if (filtroUbicacion && String(p.ubicacion_id) !== String(filtroUbicacion)) return false;
    if (busqueda) {
      const term = busqueda.toLowerCase();
      const matchCod = p.codigo_prestamo?.toLowerCase().includes(term);
      const matchEq = p.equipo?.nombre?.toLowerCase().includes(term) || p.equipo?.codigo_patrimonial?.toLowerCase().includes(term);
      const matchUsr = p.usuario?.nombre?.toLowerCase().includes(term) || p.usuario?.email?.toLowerCase().includes(term);
      const matchUb = p.ubicacion?.nombre?.toLowerCase().includes(term);
      if (!matchCod && !matchEq && !matchUsr && !matchUb) return false;
    }
    return true;
  });

  // Equipos disponibles para prestar
  const equiposDisponibles = equipos.filter(e => e.estado === 'operativo');

  return (
    <div className="space-y-6">
      
      {/* 1. Tarjetas de Resumen Superior del Módulo de Ubicaciones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sedes y Ambientes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalUbicaciones}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Laboratorios, aulas y salas</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Equipos Alojados</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalEquiposAlojados}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">Distribuidos en el campus</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Préstamos Activos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">{totalPrestamosActivos}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">En posesión de usuarios</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Usuarios con Sede</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{totalUsuariosAsignados}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Ubicación predeterminada</div>
        </div>
      </div>

      {/* Notificaciones de Éxito / Error */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Barra de Control: Pestañas y Acciones */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Switcher de Pestañas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setTabActiva('ambientes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              tabActiva === 'ambientes'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Sedes y Ambientes ({ubicaciones.length})
          </button>

          <button
            onClick={() => setTabActiva('prestamos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              tabActiva === 'prestamos'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Trazabilidad y Préstamos ({prestamos.length})
            {totalPrestamosActivos > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {totalPrestamosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => abrirModalPrestamo()}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Prestar Dispositivo
          </button>

          {isAdmin && (
            <button
              onClick={() => abrirModalUbicacion()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 transition"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Nueva Ubicación
            </button>
          )}

          <button
            onClick={cargarDatos}
            title="Recargar datos"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Contenido de la pestaña SEDES Y AMBIENTES */}
      {tabActiva === 'ambientes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ubicaciones.map((ub) => (
              <div 
                key={ub.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{ub.nombre}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {ub.pabellon || 'Sin Pabellón'} • {ub.piso || 'Nivel estándar'}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => abrirModalUbicacion(ub)}
                        className="text-[11px] text-slate-400 hover:text-blue-600 font-medium px-2 py-1 rounded-md hover:bg-slate-50 transition"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Responsable / Encargado:</span>
                      <span className="text-slate-800 font-semibold">{ub.responsable || 'No asignado'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Equipos físicos alojados:</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                        {ub.total_equipos || 0} equipos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Dispositivos en préstamo:</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        (ub.equipos_prestados_activos || 0) > 0 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ub.equipos_prestados_activos || 0} activos
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Usuarios asignados:</span>
                      <span className="text-slate-700 font-semibold">{ub.usuarios_asignados || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleVerDetalle(ub.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Detalle y Dispositivos
                  </button>

                  <button
                    onClick={() => {
                      setTabActiva('prestamos');
                      setFiltroUbicacion(String(ub.id));
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                  >
                    Ver Préstamos <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Contenido de la pestaña TRAZABILIDAD Y PRÉSTAMOS ACTIVOS */}
      {tabActiva === 'prestamos' && (
        <div className="space-y-4">
          
          {/* Filtros de Búsqueda de Préstamos */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, equipo o usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={filtroUbicacion}
                onChange={(e) => setFiltroUbicacion(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Todas las ubicaciones</option>
                {ubicaciones.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>

              <select
                value={filtroEstadoPrestamo}
                onChange={(e) => setFiltroEstadoPrestamo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">En Posesión (Activo)</option>
                <option value="devuelto">Devueltos</option>
              </select>
            </div>
          </div>

          {/* Tabla de Conexión: Quién lo tiene, Dónde está y Estado */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Dispositivo Tecnológico</th>
                    <th className="py-3 px-4">Usuario Prestatario</th>
                    <th className="py-3 px-4">Ubicación Actual / Sede</th>
                    <th className="py-3 px-4">Fecha Préstamo</th>
                    <th className="py-3 px-4">Devolución Estimada</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {prestamosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-slate-400">
                        No se encontraron registros de préstamos con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    prestamosFiltrados.map((p) => {
                      const isActivo = p.estado === 'activo';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {p.codigo_prestamo}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{p.equipo?.nombre || 'Equipo'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {p.equipo?.codigo_patrimonial} • {p.equipo?.tipo}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{p.usuario?.nombre || 'Sin usuario'}</div>
                            <div className="text-[11px] text-slate-500">
                              {p.usuario?.email} • <span className="capitalize">{p.usuario?.rol}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span>{p.ubicacion?.nombre || 'Ambiente escolar'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 pl-5">
                              {p.ubicacion?.pabellon} ({p.ubicacion?.piso})
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {p.fecha_prestamo ? new Date(p.fecha_prestamo).toLocaleDateString() : '-'}
                          </td>

                          <td className="py-3.5 px-4">
                            {p.fecha_devolucion_esperada ? (
                              <span className="font-medium text-slate-700">
                                {new Date(p.fecha_devolucion_esperada).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No fijada</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {isActivo ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                En Posesión
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Devuelto
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isActivo && (
                                <button
                                  onClick={() => handleDevolverPrestamo(p.id)}
                                  title="Marcar equipo como devuelto a la institución"
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200/80 transition flex items-center gap-1"
                                >
                                  <CornerDownLeft className="w-3.5 h-3.5" />
                                  Devolver
                                </button>
                              )}

                              {p.equipo?.codigo_qr?.codigo_hash && (
                                <Link
                                  to={`/ficha/${p.equipo.codigo_qr.codigo_hash}`}
                                  target="_blank"
                                  title="Ver Ficha Digital QR"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: REGISTRAR PRÉSTAMO CON UBICACIÓN PREDETERMINADA AUTOMÁTICA */}
      {modalPrestamoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Registrar Préstamo de Dispositivo</h3>
                  <p className="text-[11px] text-slate-500">Asigna un equipo a un usuario y vincula su ubicación</p>
                </div>
              </div>
              <button 
                onClick={() => setModalPrestamoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarPrestamo} className="space-y-4 pt-4">
              
              {/* Selección de Equipo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispositivo Tecnológico a Prestar *
                </label>
                <select
                  required
                  value={formPrestamo.equipo_id}
                  onChange={(e) => setFormPrestamo({ ...formPrestamo, equipo_id: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar Equipo Operativo --</option>
                  {equiposDisponibles.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} ({e.codigo_patrimonial}) - {e.tipo}
                    </option>
                  ))}
                </select>
                {equiposDisponibles.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1">No hay equipos en estado operativo disponibles.</p>
                )}
              </div>

              {/* Selección de Usuario Prestatario */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Usuario Prestatario (Docente / Alumno / Personal) *
                </label>
                <select
                  required
                  value={formPrestamo.usuario_id}
                  onChange={(e) => handleUsuarioChange(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar Usuario --</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email}) - {u.rol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ubicación (PREDETERMINADA automáticamente según el usuario) */}
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Ubicación del Dispositivo (Predeterminada) *
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    Auto-asignada
                  </span>
                </div>
                <select
                  required
                  value={formPrestamo.ubicacion_id}
                  onChange={(e) => setFormPrestamo({ ...formPrestamo, ubicacion_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar Ubicación --</option>
                  {ubicaciones.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.pabellon || 'Campus'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-blue-700/80 mt-1">
                  La sede se predetermina con la del usuario al registrarse. Puedes cambiarla si el préstamo es en otra aula.
                </p>
              </div>

              {/* Fecha estimada de devolución */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha Estimada de Devolución
                </label>
                <input
                  type="date"
                  value={formPrestamo.fecha_devolucion_esperada}
                  onChange={(e) => setFormPrestamo({ ...formPrestamo, fecha_devolucion_esperada: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de Préstamo / Asignatura
                </label>
                <input
                  type="text"
                  placeholder="Ej: Clase práctica de Robótica, Exposición de Proyectos"
                  value={formPrestamo.motivo}
                  onChange={(e) => setFormPrestamo({ ...formPrestamo, motivo: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Accesorios
                </label>
                <input
                  type="text"
                  placeholder="Ej: Entregado con cargador original, cable HDMI y estuche"
                  value={formPrestamo.observaciones}
                  onChange={(e) => setFormPrestamo({ ...formPrestamo, observaciones: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalPrestamoOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition"
                >
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CREAR / EDITAR UBICACIÓN */}
      {modalUbicacionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {ubicacionEdicion ? 'Editar Ubicación' : 'Nueva Ubicación'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Administración de espacios físicos del campus</p>
                </div>
              </div>
              <button 
                onClick={() => setModalUbicacionOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarUbicacion} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Ambiente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio de Robótica 1"
                  value={formUbicacion.nombre}
                  onChange={(e) => setFormUbicacion({ ...formUbicacion, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pabellón / Bloque</label>
                  <input
                    type="text"
                    placeholder="Ej: Pabellón A"
                    value={formUbicacion.pabellon}
                    onChange={(e) => setFormUbicacion({ ...formUbicacion, pabellon: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Piso / Nivel</label>
                  <input
                    type="text"
                    placeholder="Ej: 2do Piso"
                    value={formUbicacion.piso}
                    onChange={(e) => setFormUbicacion({ ...formUbicacion, piso: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsable / Encargado</label>
                <input
                  type="text"
                  placeholder="Ej: Prof. Roberto Díaz"
                  value={formUbicacion.responsable}
                  onChange={(e) => setFormUbicacion({ ...formUbicacion, responsable: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalUbicacionOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: DETALLE DEL AMBIENTE Y DISPOSITIVOS ALOJADOS */}
      {modalDetalleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {detalleUbicacion?.nombre || 'Detalle de la Ubicación'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {detalleUbicacion?.pabellon} • {detalleUbicacion?.piso} • Encargado: {detalleUbicacion?.responsable || 'No asignado'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalDetalleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cargandoDetalle ? (
              <div className="py-12 text-center text-xs text-slate-400">Cargando información del ambiente...</div>
            ) : (
              <div className="space-y-5 pt-4">
                
                {/* Dispositivos en Préstamo Activo en este ambiente */}
                <div>
                  <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Dispositivos Prestados Activos en esta Sala ({detalleUbicacion?.prestamos_activos?.length || 0})
                  </h4>
                  {detalleUbicacion?.prestamos_activos?.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center border border-slate-100">
                      No hay equipos en préstamo actualmente en esta ubicación.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detalleUbicacion?.prestamos_activos?.map((pr) => (
                        <div key={pr.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{pr.equipo?.nombre}</div>
                            <div className="text-[11px] text-slate-600">
                              Lo tiene: <span className="font-semibold text-slate-900">{pr.usuario?.nombre}</span> ({pr.usuario?.email})
                            </div>
                            <div className="text-[10px] text-amber-800 font-medium mt-0.5">
                              Motivo: {pr.motivo || 'Uso institucional'} • Devolución prevista: {pr.fecha_devolucion_esperada || 'No fijada'}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setModalDetalleOpen(false);
                              handleDevolverPrestamo(pr.id);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold shadow-2xs transition"
                          >
                            Devolver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Equipos Físicos Alojados */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    Inventario de Equipos en el Ambiente ({detalleUbicacion?.equipos?.length || 0})
                  </h4>
                  {detalleUbicacion?.equipos?.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center border border-slate-100">
                      No hay equipos asignados de forma permanente a este ambiente.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-1">
                      {detalleUbicacion?.equipos?.map((eq) => (
                        <div key={eq.id} className="p-2.5 bg-white hover:bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100 text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{eq.nombre}</span>
                            <span className="text-[11px] text-slate-500 font-mono ml-2">({eq.codigo_patrimonial})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            eq.estado === 'operativo' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : eq.estado === 'prestado'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {eq.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Usuarios que tienen esta sede predeterminada */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Usuarios con esta Ubicación Predeterminada ({detalleUbicacion?.usuarios_asignados_detalle?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detalleUbicacion?.usuarios_asignados_detalle?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No hay usuarios con esta sede por defecto.</span>
                    ) : (
                      detalleUbicacion?.usuarios_asignados_detalle?.map(u => (
                        <span key={u.id} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                          {u.nombre} <span className="text-slate-400 text-[10px]">({u.rol})</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
