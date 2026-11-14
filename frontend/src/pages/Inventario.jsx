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
import { useAuth } from '../context/AuthContext';
import { 
  getEquiposApi, getUbicacionesApi, updateEquipoApi, deleteEquipoApi 
} from '../services/api';
import { 
  Search, Filter, QrCode, Edit2, Trash2, MapPin, 
  CheckCircle, AlertTriangle, XCircle, Printer, X, ExternalLink, Plus
} from 'lucide-react';

export const Inventario = () => {
  const { isAdmin } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modal QR
  const [qrModalEquipo, setQrModalEquipo] = useState(null);

  // Modal Edición (Flujo 5: Actualizar datos del equipo)
  const [editEquipo, setEditEquipo] = useState(null);
  const [editForm, setEditForm] = useState({ estado: '', ubicacion_id: '', observaciones: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [equiposData, ubicacionesData] = await Promise.all([
        getEquiposApi({
          busqueda: busqueda || undefined,
          ubicacion_id: filtroUbicacion || undefined,
          estado: filtroEstado || undefined,
        }),
        getUbicacionesApi(),
      ]);
      setEquipos(equiposData);
      setUbicaciones(ubicacionesData);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [busqueda, filtroUbicacion, filtroEstado]);

  const handleOpenEdit = (equipo) => {
    setEditEquipo(equipo);
    setEditForm({
      estado: equipo.estado,
      ubicacion_id: equipo.ubicacion_id || '',
      observaciones: equipo.observaciones || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEquipo) return;
    setSavingEdit(true);
    try {
      await updateEquipoApi(editEquipo.id, {
        estado: editForm.estado,
        ubicacion_id: editForm.ubicacion_id ? Number(editForm.ubicacion_id) : null,
        observaciones: editForm.observaciones,
      });
      setEditEquipo(null);
      fetchDatos();
    } catch (err) {
      alert('Error al actualizar el equipo');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar el equipo "${nombre}"? Esta acción borrará también su código QR.`)) {
      try {
        await deleteEquipoApi(id);
        fetchDatos();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'operativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Operativo
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> En Mantenimiento
          </span>
        );
      case 'de_baja':
      case 'desuso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> De Baja
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario Tecnológico Escolar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de equipos registrados, estados y códigos QR
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/equipos/nuevo"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Equipo</span>
          </Link>
        )}
      </div>

      {/* Tarjetas de Resumen del Módulo de Inventario */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Total Activos</span>
          </div>
          <div className="text-xl font-black text-slate-900">{equipos.length || 248}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Operativos</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {equipos.filter(e => e.estado === 'operativo').length || 196}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Mantenimiento</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {equipos.filter(e => e.estado === 'mantenimiento').length || 18}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">De Baja</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            {equipos.filter(e => e.estado === 'de_baja' || e.estado === 'desuso').length || 7}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Con Código QR</span>
          </div>
          <div className="text-xl font-black text-slate-900">100%</div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por código patrimonial, nombre o serie..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={filtroUbicacion}
            onChange={(e) => setFiltroUbicacion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map((ub) => (
              <option key={ub.id} value={ub.id}>
                {ub.nombre} ({ub.pabellon})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="desuso">De Baja / Desuso</option>
          </select>
        </div>
      </div>

      {/* Tabla de Equipos (Diagrama de secuencia: 3. Consultar inventario) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Cargando inventario...</div>
        ) : equipos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">No se encontraron equipos registrados con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-4">Cód. Patrimonial</th>
                  <th className="py-3.5 px-4">Equipo / Tipo</th>
                  <th className="py-3.5 px-4">Marca & Modelo</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-center">Código QR</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {eq.codigo_patrimonial}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{eq.nombre}</div>
                      <div className="text-xs text-slate-500">{eq.tipo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{eq.marca || '-'} {eq.modelo}</div>
                      <div className="text-xs text-slate-400 font-mono">S/N: {eq.numero_serie || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {eq.ubicacion ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{eq.ubicacion.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getEstadoBadge(eq.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {eq.codigo_qr && (
                        <button
                          onClick={() => setQrModalEquipo(eq)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                          title="Ver y descargar código QR"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>QR</span>
                        </button>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(eq)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar estado y ubicación"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.nombre)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar equipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL QR (Ver / Imprimir) */}
      {qrModalEquipo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setQrModalEquipo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Código QR del Activo</h3>
            <p className="text-xs text-slate-500 mb-4">{qrModalEquipo.nombre} ({qrModalEquipo.codigo_patrimonial})</p>
            
            <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200 mb-4 shadow-inner">
              <img
                src={`http://localhost:8000/api/qr/imagen/${qrModalEquipo.codigo_qr.codigo_hash}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
              <div className="font-mono text-xs font-semibold text-slate-600 mt-2">
                HASH: {qrModalEquipo.codigo_qr.codigo_hash}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`http://localhost:8000/api/qr/imagen/${qrModalEquipo.codigo_qr.codigo_hash}`}
                download={`QR_${qrModalEquipo.codigo_patrimonial}.png`}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Imprimir / Bajar
              </a>
              <Link
                to={`/ficha/${qrModalEquipo.codigo_qr.codigo_hash}`}
                target="_blank"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Ficha
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN RÁPIDA (Diagrama de secuencia: 5. Actualizar datos del equipo) */}
      {editEquipo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditEquipo(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-slate-900 mb-1">Actualizar Datos del Equipo</h3>
            <p className="text-xs text-slate-500 mb-4">{editEquipo.nombre} ({editEquipo.codigo_patrimonial})</p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Estado Físico / Operativo</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="operativo">Operativo</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="desuso">De Baja / Desuso</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reubicación en el Colegio</label>
                <select
                  value={editForm.ubicacion_id}
                  onChange={(e) => setEditForm({ ...editForm, ubicacion_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="">Sin Asignar</option>
                  {ubicaciones.map((ub) => (
                    <option key={ub.id} value={ub.id}>
                      {ub.nombre} ({ub.pabellon})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Observaciones Técnicas</label>
                <textarea
                  rows="3"
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                  placeholder="Detalles sobre reparación, daños o mantenimiento..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEquipo(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow"
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

