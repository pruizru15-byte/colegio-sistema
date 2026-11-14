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
import { Search, Monitor, MapPin, QrCode, X, ArrowRight } from 'lucide-react';
import { getEquiposApi } from '../services/api';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const data = await getEquiposApi({ busqueda: query });
          setResults(data.slice(0, 5));
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Manejo de atajo Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        
        {/* Input de Búsqueda */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar por equipo, código patrimonial, serie o aula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resultados o sugerencias */}
        <div className="max-h-80 overflow-y-auto p-3">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">Buscando en el inventario...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => {
                    onClose();
                    navigate(eq.codigo_qr ? `/ficha/${eq.codigo_qr.codigo_hash}` : '/inventario');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                        {eq.nombre}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {eq.codigo_patrimonial} • {eq.ubicacion?.nombre || 'Sin ubicación'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No se encontraron coincidencias para "{query}".
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400 text-center">
              Escribe el nombre de un equipo o presiona <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300 font-mono text-[10px]">Esc</kbd> para salir.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
