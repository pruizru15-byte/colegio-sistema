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
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, AlertTriangle, CheckCircle, Clock, X, QrCode, 
  ExternalLink, ArrowRight, ShieldCheck, CheckCheck, RefreshCw
} from 'lucide-react';
import { 
  getNotificacionesApi, marcarNotificacionLeidaApi, marcarTodasNotificacionesLeidasApi 
} from '../services/api';

export const NotificationModal = ({ isOpen, onClose, onCountChange }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({ notificaciones: [], no_leidas: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const res = await getNotificacionesApi();
      setData(res);
      if (onCountChange) {
        onCountChange(res.no_leidas);
      }
    } catch (err) {
      console.error('Error al cargar notificaciones en modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones();
    }
  }, [isOpen]);

  const handleMarcarLeida = async (id, enlaceUrl, e) => {
    e.stopPropagation();
    try {
      await marcarNotificacionLeidaApi(id);
      setData(prev => ({
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1),
        notificaciones: prev.notificaciones.map(n => n.id === id ? { ...n, leido: true } : n)
      }));
      if (onCountChange) {
        onCountChange(Math.max(0, data.no_leidas - 1));
      }
      if (enlaceUrl) {
        onClose();
        navigate(enlaceUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasNotificacionesLeidasApi();
      setData(prev => ({
        ...prev,
        no_leidas: 0,
        notificaciones: prev.notificaciones.map(n => ({ ...n, leido: true }))
      }));
      if (onCountChange) {
        onCountChange(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn select-none">
      
      {/* Cabecera del Dropdown */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 leading-tight">Centro de Notificaciones</h3>
            <span className="text-[10px] text-slate-400">
              {data.no_leidas > 0 ? `${data.no_leidas} no leídas` : 'Al día'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {data.no_leidas > 0 && (
            <button
              onClick={handleMarcarTodasLeidas}
              title="Marcar todas como leídas"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200/50 transition text-[11px]"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Sincronizando alertas...</span>
          </div>
        ) : data.notificaciones.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="font-semibold text-slate-600">No hay notificaciones pendientes</p>
            <p className="text-[11px] text-slate-400">Todo el inventario escolar está al día.</p>
          </div>
        ) : (
          data.notificaciones.slice(0, 6).map((item) => {
            const isDanger = item.tipo === 'danger';
            const isWarning = item.tipo === 'warning';
            const isSuccess = item.tipo === 'success';

            return (
              <div 
                key={item.id}
                onClick={(e) => handleMarcarLeida(item.id, item.enlace_url, e)}
                className={`p-3 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                  !item.leido ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                  isDanger ? 'bg-rose-100 text-rose-600' :
                  isWarning ? 'bg-amber-100 text-amber-600' :
                  isSuccess ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {isDanger ? <AlertTriangle className="w-4 h-4" /> :
                   isWarning ? <Clock className="w-4 h-4" /> :
                   isSuccess ? <CheckCircle className="w-4 h-4" /> :
                   <Bell className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-xs truncate ${!item.leido ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {item.titulo}
                    </h4>
                    {!item.leido && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                    {item.descripcion}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie con Enlace a la Página Completa */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold">
        <button
          onClick={handleMarcarTodasLeidas}
          className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
        >
          Marcar leídas
        </button>

        <Link
          to="/notificaciones"
          onClick={onClose}
          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-[11px]"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};
