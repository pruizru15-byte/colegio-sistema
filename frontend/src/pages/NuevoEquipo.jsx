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
import { useNavigate } from 'react-router-dom';
import { createEquipoApi, getUbicacionesApi, API_BASE_URL } from '../services/api';
import { QrCode, ArrowLeft, CheckCircle, Printer, Plus, AlertCircle } from 'lucide-react';

export const NuevoEquipo = () => {
  const navigate = useNavigate();
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Resultado tras registrar exitosamente
  const [equipoCreado, setEquipoCreado] = useState(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const data = await getUbicacionesApi();
        setUbicaciones(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, ubicacion_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error cargando ubicaciones', err);
      }
    };
    fetchUbicaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        ubicacion_id: formData.ubicacion_id ? Number(formData.ubicacion_id) : null,
      };
      // Flujo 2: Registrar equipo -> Retorna equipo registrado + QR
      const res = await createEquipoApi(payload);
      setEquipoCreado(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar el equipo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Botón Volver y Título */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/inventario')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inventario
        </button>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Módulo de Alta de Activos
        </span>
      </div>

      {/* Tarjetas de Resumen Superior */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Aulas / Ambientes</div>
          <div className="text-xl font-black text-slate-900">{ubicaciones.length || 12} disponibles</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Listas para asignación</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Generación de QR</div>
          <div className="text-xl font-black text-blue-600">Automática</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Impresión inmediata</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Estado Inicial</div>
          <div className="text-xl font-black text-emerald-600">Operativo</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Configuración por defecto</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Trazabilidad</div>
          <div className="text-xl font-black text-indigo-600">100% Única</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Auditoría escolar</div>
        </div>
      </div>

      {/* Si se acaba de registrar, mostrar pantalla de confirmación con QR */}
      {equipoCreado ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center animate-fade-in">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Equipo Registrado Exitosamente!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Se generó automáticamente su código QR único vinculado en el sistema.
          </p>

          <div className="my-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
            {equipoCreado.codigo_qr ? (
              <img
                src={`${API_BASE_URL}/qr/imagen/${equipoCreado.codigo_qr.codigo_hash}`}
                alt="QR Code"
                className="w-56 h-56 mx-auto mb-3"
              />
            ) : (
              <QrCode className="w-48 h-48 mx-auto text-slate-400" />
            )}
            <div className="font-mono text-sm font-bold text-slate-700">
              {equipoCreado.codigo_patrimonial}
            </div>
            <div className="text-xs text-slate-500">{equipoCreado.nombre}</div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {equipoCreado.codigo_qr && (
              <a
                href={`${API_BASE_URL}/qr/imagen/${equipoCreado.codigo_qr.codigo_hash}`}
                download={`QR_${equipoCreado.codigo_patrimonial}.png`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" /> Imprimir Etiqueta QR
              </a>
            )}
            <button
              onClick={() => {
                setEquipoCreado(null);
                setFormData({
                  codigo_patrimonial: '',
                  nombre: '',
                  tipo: 'Computadora de Escritorio',
                  marca: '',
                  modelo: '',
                  numero_serie: '',
                  estado: 'operativo',
                  ubicacion_id: ubicaciones[0]?.id || '',
                  observaciones: '',
                });
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
            >
              Registrar Otro Equipo
            </button>
          </div>
        </div>
      ) : (
        /* Formulario de Registro (Flujo 2) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Registrar Nuevo Activo Tecnológico</h1>
            <p className="text-sm text-slate-500 mt-1">
              Ingresa los datos técnicos del equipo para asignar su ubicación y generar su código QR.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Código Patrimonial <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: COL-PC-001"
                  value={formData.codigo_patrimonial}
                  onChange={(e) => setFormData({ ...formData, codigo_patrimonial: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nombre descriptivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Computadora Docente Lab 1"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tipo de Activo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Computadora de Escritorio">Computadora de Escritorio</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Proyector Multimedia">Proyector Multimedia</option>
                  <option value="Impresora / Multifuncional">Impresora / Multifuncional</option>
                  <option value="Switch / Router de Red">Switch / Router de Red</option>
                  <option value="Tablet / Pantalla Táctil">Tablet / Pantalla Táctil</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  placeholder="Ej: HP, Dell, Epson"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Modelo</label>
                <input
                  type="text"
                  placeholder="Ej: ProDesk 400 G6"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Número de Serie</label>
                <input
                  type="text"
                  placeholder="Ej: S/N 4CZ93810LP"
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ubicación en Colegio</label>
                <select
                  value={formData.ubicacion_id}
                  onChange={(e) => setFormData({ ...formData, ubicacion_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {ubicaciones.map((ub) => (
                    <option key={ub.id} value={ub.id}>
                      {ub.nombre} ({ub.pabellon})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Estado Inicial</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="operativo">Operativo</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="desuso">De Baja</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Observaciones / Especificaciones</label>
              <textarea
                rows="3"
                placeholder="Ej: RAM 16GB, SSD 512GB, teclado y mouse incluidos..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/inventario')}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Registrando y generando QR...' : 'Guardar y Generar QR'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

