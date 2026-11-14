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
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, Camera, ArrowRight, AlertCircle } from 'lucide-react';

export const EscanerQR = () => {
  const navigate = useNavigate();
  const [codigoManual, setCodigoManual] = useState('');
  const [scannerActivo, setScannerActivo] = useState(true);

  useEffect(() => {
    let scanner = null;
    if (scannerActivo) {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            // Si el texto es una URL completa (ej. http://.../ficha/HASH)
            let hash = decodedText;
            if (decodedText.includes('/ficha/')) {
              hash = decodedText.split('/ficha/')[1];
            }
            scanner.clear();
            navigate(`/ficha/${hash}`);
          },
          (error) => {
            // escaneo continuo sin errores críticos
          }
        );
      } catch (e) {
        console.warn('No se pudo inicializar la cámara:', e);
      }
    }

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {}
      }
    };
  }, [scannerActivo, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    let hash = codigoManual.trim();
    if (hash.includes('/ficha/')) {
      hash = hash.split('/ficha/')[1];
    }
    navigate(`/ficha/${hash}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Tarjetas de Resumen Superior del Módulo QR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Modo de Lectura</div>
          <div className="text-xl font-black text-slate-900">Cámara Activa</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Detección a 10 FPS</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Ingreso Manual</div>
          <div className="text-xl font-black text-blue-600">Por Código Hash</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Acceso sin cámara</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Ficha Técnica</div>
          <div className="text-xl font-black text-indigo-600">Instantánea</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Ubicación y estado</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">Acceso Escolar</div>
          <div className="text-xl font-black text-cyan-600">Público</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Para alumnos y docentes</div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2 shadow-2xs">
            <ScanLine className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Escanear Código QR</h1>
          <p className="text-xs text-slate-500 mt-1">
            Apunta la cámara al código QR impreso en el equipo o ingresa el código hash.
          </p>
        </div>

      {/* Visor de Cámara */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 mb-6">
        <div id="qr-reader" className="w-full rounded-2xl overflow-hidden"></div>
      </div>

      {/* Ingreso Manual de Respaldo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-semibold text-sm text-slate-800 mb-1">¿No tienes cámara o estás en pruebas?</h3>
        <p className="text-xs text-slate-500 mb-4">Ingresa el código hash o enlace del QR manualmente:</p>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: A1B2C3D4E5F6"
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            Consultar <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
);
};

