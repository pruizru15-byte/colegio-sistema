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

import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, X, QrCode } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose, notifications = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Centro de Notificaciones</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {notifications.map((item, index) => (
          <div key={index} className="p-3.5 hover:bg-slate-50 transition flex items-start gap-3">
            <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
              item.tipo === 'danger' ? 'bg-red-50 text-red-600' :
              item.tipo === 'warning' ? 'bg-amber-50 text-amber-600' :
              item.tipo === 'success' ? 'bg-emerald-50 text-emerald-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {item.tipo === 'danger' ? <QrCode className="w-4 h-4" /> :
               item.tipo === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
               item.tipo === 'success' ? <CheckCircle className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 truncate">{item.titulo}</h4>
                <span className="text-[10px] font-semibold text-slate-400">{item.badge}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
        <button
          onClick={onClose}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Marcar todas como leídas
        </button>
      </div>
    </div>
  );
};
