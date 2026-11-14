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
import { useParams, Link } from 'react-router-dom';
import { getFichaQRApi } from '../services/api';
import { 
  QrCode, MapPin, Monitor, CheckCircle, AlertTriangle, 
  XCircle, ArrowLeft, Printer, ShieldCheck, User 
} from 'lucide-react';

export const FichaPublicaQR = () => {
  const { codigo_hash } = useParams();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFicha = async () => {
      try {
        const data = await getFichaQRApi(codigo_hash);
        setFicha(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'No se pudo cargar la información del código QR.');
      } finally {
        setLoading(false);
      }
    };
    fetchFicha();
  }, [codigo_hash]);

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'operativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-4 h-4" /> Operativo
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-4 h-4" /> En Mantenimiento
          </span>
        );
      case 'de_baja':
      case 'desuso':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" /> De Baja
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Consultando activo tecnológico...</p>
        </div>
      </div>
    );
  }

  if (error || !ficha) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-4 inline-block">
          <XCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Código QR no válido</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'El equipo consultado no fue encontrado en el sistema.'}</p>
        <Link
          to="/inventario"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Ir al Inventario
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Botón Volver */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/inventario"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Panel de inventario
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
        >
          <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
        </button>
      </div>

      {/* Tarjeta de Ficha Técnica Digital */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Banner Superior */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full mb-2 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Activo Escolar Verificado
            </div>
            <h1 className="text-2xl font-bold">{ficha.nombre}</h1>
            <p className="text-blue-100 text-sm mt-0.5">Código Patrimonial: <span className="font-mono font-bold text-white">{ficha.codigo_patrimonial}</span></p>
          </div>
          <div>
            {getEstadoBadge(ficha.estado)}
          </div>
        </div>

        {/* Cuerpo de la Ficha */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Ubicación y Responsable */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ubicación Física del Equipo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {ficha.ubicacion?.nombre || 'Sin ubicación asignada'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {ficha.ubicacion?.pabellon} • {ficha.ubicacion?.piso}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Responsable del Ambiente
                  </div>
                  <div className="text-xs text-slate-500">
                    {ficha.ubicacion?.responsable || 'No asignado'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400">Tipo de Activo</div>
                <div className="font-semibold text-slate-800 mt-1">{ficha.tipo}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400">Marca</div>
                <div className="font-semibold text-slate-800 mt-1">{ficha.marca || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400">Modelo</div>
                <div className="font-semibold text-slate-800 mt-1">{ficha.modelo || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400">N° de Serie</div>
                <div className="font-semibold font-mono text-slate-800 mt-1">{ficha.numero_serie || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {ficha.observaciones && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones</h3>
              <p className="text-sm text-slate-600 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                {ficha.observaciones}
              </p>
            </div>
          )}

          {/* Código QR Asociado */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {ficha.qr_imagen_base64 && (
                <img
                  src={ficha.qr_imagen_base64}
                  alt="QR"
                  className="w-16 h-16 rounded-lg border border-slate-200"
                />
              )}
              <div>
                <div className="text-xs font-bold text-slate-700">Identificador QR</div>
                <div className="font-mono text-xs text-slate-500">{ficha.codigo_hash}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right">
              Sistema de Inventario Tecnológico Escolar
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
