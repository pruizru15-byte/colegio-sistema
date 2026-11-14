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
  Users, UserPlus, Search, Filter, ShieldCheck, 
  UserCheck, Wrench, GraduationCap, Edit, Trash2, 
  X, Check, Lock, Mail, User, AlertCircle 
} from 'lucide-react';
import { 
  getUsuariosApi, createUsuarioApi, updateUsuarioApi, deleteUsuarioApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  // Formulario Crear
  const [formCrear, setFormCrear] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'docente'
  });

  // Formulario Editar
  const [formEditar, setFormEditar] = useState({
    nombre: '',
    email: '',
    rol: '',
    password: ''
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getUsuariosApi({
        busqueda: busqueda || undefined,
        rol: filtroRol || undefined
      });
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [busqueda, filtroRol]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      await createUsuarioApi(formCrear);
      setModalCrear(false);
      setFormCrear({ nombre: '', email: '', password: '', rol: 'docente' });
      showToast('¡Usuario registrado exitosamente!');
      cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al registrar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleAbrirEditar = (u) => {
    setModalEditar(u);
    setFormEditar({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      password: ''
    });
    setErrorMsg('');
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!modalEditar) return;
    setErrorMsg('');
    setSaving(true);
    try {
      const payload = {
        nombre: formEditar.nombre,
        email: formEditar.email,
        rol: formEditar.rol
      };
      if (formEditar.password.trim()) {
        payload.password = formEditar.password.trim();
      }
      await updateUsuarioApi(modalEditar.id, payload);
      setModalEditar(null);
      showToast('¡Datos del usuario actualizados!');
      cargarUsuarios();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (u) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${u.nombre}?`)) {
      try {
        await deleteUsuarioApi(u.id);
        showToast('Usuario eliminado del sistema.');
        cargarUsuarios();
      } catch (err) {
        alert(err.response?.data?.detail || 'Error al eliminar usuario.');
      }
    }
  };

  // Métricas
  const totalUsuarios = usuarios.length;
  const countAdmins = usuarios.filter(u => u.rol === 'administrador').length;
  const countTecnicos = usuarios.filter(u => u.rol === 'tecnico').length;
  const countDocentes = usuarios.filter(u => u.rol === 'docente' || u.rol === 'consulta').length;

  const getRolBadge = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'administrador':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Administrador
          </span>
        );
      case 'tecnico':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Wrench className="w-3.5 h-3.5 text-amber-600" /> Soporte Técnico
          </span>
        );
      case 'docente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Docente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Consulta
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notificación */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios y Accesos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra los roles, cuentas y permisos institucionales del sistema
          </p>
        </div>

        <button
          onClick={() => {
            setModalCrear(true);
            setErrorMsg('');
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow text-xs transition duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Total Usuarios</span>
          </div>
          <div className="text-xl font-black text-slate-900">{totalUsuarios}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Administradores</span>
          </div>
          <div className="text-xl font-black text-slate-900">{countAdmins}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Soporte Técnico</span>
          </div>
          <div className="text-xl font-black text-slate-900">{countTecnicos}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">Docentes / Consulta</span>
          </div>
          <div className="text-xl font-black text-slate-900">{countDocentes}</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo institucional..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
          >
            <option value="">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="tecnico">Soporte Técnico</option>
            <option value="docente">Docente</option>
            <option value="consulta">Solo Consulta</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No se encontraron usuarios registrados con los criterios ingresados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3.5 px-5">Usuario</th>
                  <th className="py-3.5 px-4">Correo Institucional</th>
                  <th className="py-3.5 px-4">Rol Asignado</th>
                  <th className="py-3.5 px-4">Fecha de Registro</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => {
                  const esYoMismo = currentUser?.id === u.id;
                  const iniciales = u.nombre
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Avatar e Identidad */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shadow-inner">
                            {iniciales}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{u.nombre}</span>
                              {esYoMismo && (
                                <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold">Tú</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                        {u.email}
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4">
                        {getRolBadge(u.rol)}
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        <button
                          onClick={() => handleAbrirEditar(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar usuario o restablecer contraseña"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {!esYoMismo && (
                          <button
                            onClick={() => handleEliminar(u)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR USUARIO */}
      {modalCrear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-fade-in">
            <button
              onClick={() => setModalCrear(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Usuario</h3>
                <p className="text-[11px] text-slate-400">Asigna credenciales y rol de acceso</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCrear} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lic. Marcos Alanya"
                    value={formCrear.nombre}
                    onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Institucional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="marcos.alanya@colegio.edu.pe"
                    value={formCrear.email}
                    onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraseña Inicial</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formCrear.password}
                    onChange={(e) => setFormCrear({ ...formCrear, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol en el Colegio</label>
                <select
                  value={formCrear.rol}
                  onChange={(e) => setFormCrear({ ...formCrear, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="administrador">Administrador (Gestión total)</option>
                  <option value="tecnico">Soporte Técnico (Mantenimientos e Inventario)</option>
                  <option value="docente">Docente (Consulta y reporte)</option>
                  <option value="consulta">Solo Consulta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 animate-fade-in">
            <button
              onClick={() => setModalEditar(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Editar Usuario</h3>
                <p className="text-[11px] text-slate-400">Modifica datos o restablece la contraseña</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditar} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Institucional</label>
                <input
                  type="email"
                  required
                  value={formEditar.email}
                  onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol</label>
                <select
                  value={formEditar.rol}
                  onChange={(e) => setFormEditar({ ...formEditar, rol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="administrador">Administrador</option>
                  <option value="tecnico">Soporte Técnico</option>
                  <option value="docente">Docente</option>
                  <option value="consulta">Solo Consulta</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nueva Contraseña <span className="text-slate-400 font-normal">(dejar en blanco para no cambiarla)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formEditar.password}
                  onChange={(e) => setFormEditar({ ...formEditar, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
