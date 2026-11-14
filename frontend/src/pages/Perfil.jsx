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
  User, Mail, Lock, ShieldCheck, Key, Check, 
  AlertCircle, Shield, Laptop, GraduationCap, 
  Wrench, Bell, Sun, Moon, LaptopMinimal, CheckCircle2, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updatePerfilApi, cambiarPasswordApi, getUbicacionesApi } from '../services/api';

export const Perfil = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('datos');
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    getUbicacionesApi().then(setUbicaciones).catch(console.error);
  }, []);

  // Formulario Datos Personales
  const [formPerfil, setFormPerfil] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    ubicacion_defecto_id: user?.ubicacion_defecto_id ? String(user.ubicacion_defecto_id) : '',
  });

  // Formulario Cambiar Contraseña
  const [formPassword, setFormPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Preferencias
  const [notifEmail, setNotifEmail] = useState(true);
  const [autoScan, setAutoScan] = useState(true);

  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Guardar Datos Personales
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSavingPerfil(true);
    try {
      const payload = {
        nombre: formPerfil.nombre,
        email: formPerfil.email,
        ubicacion_defecto_id: formPerfil.ubicacion_defecto_id ? parseInt(formPerfil.ubicacion_defecto_id) : null
      };
      const res = await updatePerfilApi(payload);
      updateUser(res);
      triggerToast('¡Datos del perfil actualizados con éxito!');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al actualizar el perfil.');
    } finally {
      setSavingPerfil(false);
    }
  };

  // Cambiar Contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formPassword.new_password !== formPassword.confirm_password) {
      setErrorMsg('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (formPassword.new_password.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSavingPwd(true);
    try {
      await cambiarPasswordApi({
        current_password: formPassword.current_password,
        new_password: formPassword.new_password,
      });
      setFormPassword({ current_password: '', new_password: '', confirm_password: '' });
      triggerToast('¡Contraseña actualizada exitosamente!');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Error al cambiar la contraseña.');
    } finally {
      setSavingPwd(false);
    }
  };

  const getRolDetails = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'administrador':
        return {
          label: 'Administrador General',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: ShieldCheck,
          permissions: [
            'Acceso total a gestión de equipos e inventario',
            'Creación, edición y eliminación de usuarios del sistema',
            'Generación, regeneración e impresión masiva de códigos QR',
            'Administración y reubicación de aulas y laboratorios',
            'Exportación de reportes ejecutivos en PDF y Excel',
          ],
        };
      case 'tecnico':
        return {
          label: 'Soporte Técnico Especializado',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Wrench,
          permissions: [
            'Registro y actualización de estado técnico de equipos',
            'Visualización y generación de etiquetas QR',
            'Registro de incidencias y órdenes de mantenimiento',
            'Consulta detallada de ubicaciones',
          ],
        };
      case 'docente':
        return {
          label: 'Docente / Personal Educativo',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: GraduationCap,
          permissions: [
            'Consulta de equipos asignados a aulas y laboratorios',
            'Escaneo de códigos QR para revisión de fichas técnicas',
            'Reporte de incidencias y observaciones sobre equipos',
          ],
        };
      default:
        return {
          label: 'Usuario de Consulta',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: User,
          permissions: [
            'Escaneo de códigos QR y lectura de fichas técnicas',
            'Búsqueda en catálogo general de inventario escolar',
          ],
        };
    }
  };

  const rolInfo = getRolDetails(user?.rol);
  const RolIcon = rolInfo.icon;

  const iniciales = (user?.nombre || 'AD')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tarjetas de Resumen Superior del Módulo de Perfil */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Rol de Autorización</div>
          <div className="text-xl font-black text-slate-900 capitalize">{user?.rol || 'Administrador'}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Nivel Institucional</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Seguridad de Acceso</div>
          <div className="text-xl font-black text-emerald-600">BCrypt (72b)</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Hash unidireccional</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Token de Sesión</div>
          <div className="text-xl font-black text-blue-600">JWT Activo</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Expira en 12 horas</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Estado de Cuenta</div>
          <div className="text-xl font-black text-cyan-600">Verificada</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Colegio UCV</div>
        </div>
      </div>

      {/* Banner de Cabecera del Perfil */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 relative">
          <div className="absolute top-4 right-4 text-white/70 text-xs font-semibold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            Institución Educativa UCV
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-inner">
                {iniciales}
              </div>
            </div>

            <div className="mb-1">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {user?.nombre || 'Administrador General'}
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${rolInfo.badgeClass}`}>
              <RolIcon className="w-3.5 h-3.5" />
              <span>{rolInfo.label}</span>
            </span>
          </div>

        </div>
      </div>

      {/* Grid Principal: Columna Izquierda (Resumen) + Columna Derecha (Formularios) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Tarjeta Informativa de la Cuenta */}
        <div className="space-y-4">
          
          {/* Tarjeta de Seguridad y Estado */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Estado de la Cuenta</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado de acceso</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Activo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Identificador único</span>
                <span className="font-mono font-bold text-slate-700">USR-00{user?.id || 1}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sede Asignada</span>
                <span className="font-semibold text-blue-700 text-[11px] truncate max-w-[140px]" title={user?.ubicacion_defecto?.nombre}>
                  {user?.ubicacion_defecto?.nombre || 'Laboratorio de Cómputo 1'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Encriptación de clave</span>
                <span className="font-mono text-slate-700">BCrypt (72b)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sesión actual</span>
                <span className="font-mono text-blue-600 font-bold">JWT Activo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tus credenciales están protegidas bajo estándares de seguridad escolar. Nunca compartas tu contraseña institucional.
              </p>
            </div>
          </div>

          {/* Menú de Pestañas Rápidas */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs space-y-1 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('datos'); setErrorMsg(''); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'datos'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Datos Personales</span>
            </button>

            <button
              onClick={() => { setActiveTab('password'); setErrorMsg(''); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'password'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Seguridad & Contraseña</span>
            </button>

            <button
              onClick={() => { setActiveTab('permisos'); setErrorMsg(''); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'permisos'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Permisos del Rol</span>
            </button>

            <button
              onClick={() => { setActiveTab('preferencias'); setErrorMsg(''); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                activeTab === 'preferencias'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Preferencias de UI</span>
            </button>
          </div>

        </div>

        {/* Columna Derecha: Contenido de la Pestaña Activa */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
            
            {/* Mensajes de error general */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* PESTAÑA 1: DATOS PERSONALES */}
            {activeTab === 'datos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Datos Personales</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Actualiza tu nombre institucional y correo electrónico vinculado a la cuenta.
                  </p>
                </div>

                <form onSubmit={handleGuardarPerfil} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formPerfil.nombre}
                        onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Correo Institucional <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={formPerfil.email}
                        onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Rol Institucional</label>
                    <input
                      type="text"
                      disabled
                      value={rolInfo.label}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      El rol solo puede ser modificado desde el módulo de usuarios por un Administrador.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Ubicación Predeterminada Asignada</span>
                      <span className="text-[10px] text-blue-600 font-normal">Sede por defecto para préstamos</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={formPerfil.ubicacion_defecto_id}
                        onChange={(e) => setFormPerfil({ ...formPerfil, ubicacion_defecto_id: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-white"
                      >
                        <option value="">-- Sin ubicación predeterminada --</option>
                        {ubicaciones.map((ub) => (
                          <option key={ub.id} value={ub.id}>
                            {ub.nombre} ({ub.pabellon || 'Campus'}) - {ub.piso || 'Nivel estándar'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Al solicitar o prestar dispositivos, esta sede se predetermina automáticamente en el sistema.
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPerfil}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition"
                    >
                      {savingPerfil ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PESTAÑA 2: SEGURIDAD Y CONTRASEÑA */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Actualizar Contraseña</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Para mayor seguridad, te recomendamos renovar tu contraseña periódicamente.
                  </p>
                </div>

                <form onSubmit={handleCambiarPassword} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Contraseña Actual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="Ingresa tu contraseña actual"
                        value={formPassword.current_password}
                        onChange={(e) => setFormPassword({ ...formPassword, current_password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={formPassword.new_password}
                          onChange={(e) => setFormPassword({ ...formPassword, new_password: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          placeholder="Repite la nueva contraseña"
                          value={formPassword.confirm_password}
                          onChange={(e) => setFormPassword({ ...formPassword, confirm_password: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requisitos de seguridad */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[11px] space-y-1.5 text-slate-500">
                    <div className="font-bold text-slate-700 mb-1">Requisitos de la contraseña:</div>
                    <div className={`flex items-center gap-1.5 ${formPassword.new_password.length >= 6 ? 'text-emerald-600 font-bold' : ''}`}>
                      <Check className="w-3.5 h-3.5" /> Mínimo 6 caracteres
                    </div>
                    <div className={`flex items-center gap-1.5 ${formPassword.new_password && formPassword.new_password === formPassword.confirm_password ? 'text-emerald-600 font-bold' : ''}`}>
                      <Check className="w-3.5 h-3.5" /> Las contraseñas deben coincidir
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingPwd}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition"
                    >
                      {savingPwd ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PESTAÑA 3: PERMISOS DEL ROL */}
            {activeTab === 'permisos' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Privilegios y Permisos</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Detalle de los módulos y operaciones habilitadas para tu rol institucional actual.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                    <RolIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">Rol: {rolInfo.label}</div>
                    <div className="text-[11px] text-slate-500">Nivel de autorización institucional asignado</div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {rolInfo.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-2xs text-xs text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 4: PREFERENCIAS DE UI */}
            {activeTab === 'preferencias' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Preferencias de la Interfaz</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personaliza la experiencia visual y las notificaciones del sistema.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-2">Tema Visual</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => { setTheme('claro'); triggerToast('Tema Claro activado'); }}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                          theme === 'claro' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        <span>Claro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setTheme('oscuro'); triggerToast('Tema Oscuro activado'); }}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                          theme === 'oscuro' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        <span>Oscuro</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setTheme('combinado'); triggerToast('Tema Combinado activado'); }}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                          theme === 'combinado' ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <LaptopMinimal className="w-5 h-5" />
                        <span>Combinado</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <div className="font-bold text-slate-800">Alertas y Notificaciones Críticas</div>
                        <div className="text-[11px] text-slate-400">Mostrar alertas de mantenimientos e incidencias en la cabecera</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <div className="font-bold text-slate-800">Auto-apertura de Ficha tras Escaneo QR</div>
                        <div className="text-[11px] text-slate-400">Redirigir automáticamente a la ficha del equipo al detectar un código</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoScan}
                        onChange={(e) => setAutoScan(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
