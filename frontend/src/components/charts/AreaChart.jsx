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

export const AreaChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxY = 40;
  const yLabels = [40, 35, 30, 25, 20, 15, 10, 5, 0];
  const width = 460;
  const height = 180;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 26;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + (1 - item.movimientos / maxY) * chartHeight;
    return { x, y, ...item };
  });

  // Construir curva SVG suave (Catmull-Rom o Bézier)
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${height - paddingBottom} L ${points[0]?.x || 0} ${height - paddingBottom} Z`;

  return (
    <div className="relative pt-2 pb-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Líneas horizontales de guía */}
        {yLabels.map((val) => {
          const y = paddingTop + (1 - val / maxY) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-medium"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Relleno con gradiente */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Línea principal */}
        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

        {/* Puntos y etiquetas */}
        {points.map((pt, i) => {
          const isHovered = hoveredPoint === i;
          return (
            <g key={i} className="cursor-pointer">
              {/* Valor encima del punto */}
              <text
                x={pt.x}
                y={pt.y - 7}
                textAnchor="middle"
                className={`text-[9px] font-bold transition-all ${
                  isHovered ? 'fill-blue-600 font-extrabold' : 'fill-slate-700'
                }`}
              >
                {pt.movimientos}
              </text>

              {/* Punto circular */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5 : 3.5}
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth={isHovered ? 2.5 : 2}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Etiqueta del mes en eje X */}
              <text
                x={pt.x}
                y={height - 6}
                textAnchor="middle"
                className="text-[9px] fill-slate-500 font-medium"
              >
                {pt.mes}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Rótulo Eje Y */}
      <div className="absolute -left-3 top-1/2 -rotate-90 -translate-y-1/2 text-[9px] font-semibold text-slate-400 uppercase tracking-widest pointer-events-none">
        N.° de movimientos
      </div>
    </div>
  );
};
