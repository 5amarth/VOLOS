import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { distinctHueColors } from '../utils/colorScale';
import './Charts.css';

// paths: array of arrays (each path is N values, not including t=0)
export default function PathsChart({ paths, S_0, T, height = 380 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { data, pathKeys, colors } = useMemo(() => {
    if (!paths || paths.length === 0) return { data: [], pathKeys: [], colors: [] };

    const numPaths = paths.length;
    const numSteps = paths[0].length;
    const keys = Array.from({ length: numPaths }, (_, i) => `path${i}`);
    const hueColors = distinctHueColors(numPaths);

    const rows = [];
    // t=0 row, all paths start at S_0
    const initialRow = { step: 0, time: 0 };
    keys.forEach((k) => { initialRow[k] = S_0; });
    rows.push(initialRow);

    for (let step = 0; step < numSteps; step++) {
      const row = { step: step + 1, time: (T * (step + 1)) / numSteps };
      keys.forEach((k, pathIdx) => { row[k] = paths[pathIdx][step]; });
      rows.push(row);
    }

    return { data: rows, pathKeys: keys, colors: hueColors };
  }, [paths, S_0, T]);

  if (data.length === 0) {
    return <p className="chart-empty">No sample paths available.</p>;
  }

  return (
    <div>
      <div className="chart-wrap" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#2A2A3A" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={(v) => v.toFixed(2)}
              stroke="#7A7059"
              tick={{ fill: '#B3A688', fontSize: 10, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}
              label={{ value: 'Time (years)', position: 'insideBottom', offset: -4, fill: '#B3A688', fontSize: 10 }}
            />
            <YAxis
              stroke="#7A7059"
              tick={{ fill: '#B3A688', fontSize: 10, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}
              label={{ value: 'Stock Price', angle: -90, position: 'insideLeft', fill: '#B3A688', fontSize: 10 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ background: '#1C1C28', border: '1px solid #3D3D52', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
              labelStyle={{ color: '#D4A820' }}
              formatter={(value) => [Number(value).toFixed(4), 'Price']}
              labelFormatter={(v) => `t = ${Number(v).toFixed(3)}y`}
            />
            {pathKeys.map((key, i) => {
              const isHovered = hoveredIdx === i;
              const isDimmed = hoveredIdx !== null && !isHovered;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i]}
                  strokeWidth={isHovered ? 2.5 : 1}
                  strokeOpacity={isDimmed ? 0.12 : 1}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="paths-legend">
        {pathKeys.map((key, i) => (
          <button
            key={key}
            type="button"
            className={`paths-legend-item ${hoveredIdx === i ? 'paths-legend-item--active' : ''}`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onFocus={() => setHoveredIdx(i)}
            onBlur={() => setHoveredIdx(null)}
          >
            <span className="paths-legend-swatch" style={{ background: colors[i] }} />
            Path {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
