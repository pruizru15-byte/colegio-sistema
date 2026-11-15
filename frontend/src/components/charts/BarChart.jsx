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

import React, { useState } from 'react';

export const BarChart = ({ data = [] }) => {
  const [hovered, setHovered] = useState(null);
  
  const cantidades = data.map(d => d.cantidad || 0);
  const maxCantidad = cantidades.length > 0 ? Math.max(...cantidades) : 10;
  const step = Math.max(Math.ceil(maxCantidad / 5), 1);
  const maxVal = Math.max(step * 5, 5);
  const ySteps = [maxVal, step * 4, step * 3, step * 2, step * 1, 0];

  return (
    <div className="relative pt-4 pb-2">
      <div className="flex h-52 items-end gap-2 sm:gap-4 pl-8 pr-2 relative">
        
        {/* Eje Y y líneas horizontales de guía */}
        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-slate-400 font-medium">
          {ySteps.map((val) => (
            <div key={val} className="flex items-center justify-end pr-1">
              {val}
            </div>
          ))}
        </div>

        {/* Líneas de cuadrícula tenue */}
        <div className="absolute left-8 right-2 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
          {ySteps.map((val) => (
            <div key={val} className="w-full border-b border-slate-100" />
          ))}
        </div>

        {/* Barras verticales */}
        <div className="flex-1 flex justify-between items-end h-[calc(100%-24px)] z-10 px-2 gap-2 sm:gap-3">
          {data.map((item, index) => {
            const heightPct = Math.round((item.cantidad / maxVal) * 100);
            const isHovered = hovered === index;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Valor arriba de la barra */}
                <span className={`text-[11px] font-bold mb-1 transition-transform ${isHovered ? 'scale-110 text-blue-600' : 'text-slate-700'}`}>
                  {item.cantidad}
                </span>

                {/* Barra */}
                <div
                  className="w-full max-w-[36px] rounded-t-md transition-all duration-300 shadow-sm"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: item.color,
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                    transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                    transformOrigin: 'bottom',
                  }}
                />

                {/* Etiqueta X */}
                <span className="text-[10px] font-medium text-slate-600 mt-2 truncate max-w-[50px] text-center">
                  {item.ubicacion}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Rótulo Eje Y */}
      <div className="absolute -left-3 top-1/2 -rotate-90 -translate-y-1/2 text-[9px] font-semibold text-slate-400 uppercase tracking-widest pointer-events-none">
        N.° de equipos
      </div>
    </div>
  );
};
