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

export const DonutChart = ({ data = [], total = 248 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Radio y circunferencia para el cálculo de SVG
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
      {/* Gráfico SVG Donut */}
      <div className="relative w-[180px] h-[180px] flex-shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {data.map((item, index) => {
            const strokeDasharray = `${(item.porcentaje / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercent / 100) * circumference);
            cumulativePercent += item.porcentaje;
            const isHovered = hoveredIndex === index;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Texto Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            {hoveredIndex !== null ? data[hoveredIndex].cantidad : total}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {hoveredIndex !== null ? data[hoveredIndex].nombre : 'Equipos'}
          </span>
        </div>
      </div>

      {/* Leyenda Detallada */}
      <div className="flex-1 space-y-2 w-full text-xs">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-1.5 rounded-lg transition cursor-pointer ${
                isHovered ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span>{item.nombre}:</span>
              </div>
              <span className="font-semibold text-slate-800">
                {item.cantidad} ({item.porcentaje}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
