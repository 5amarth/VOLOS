import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import './Charts.css';

// data: array of { strike, iv } sorted by strike, for a fixed maturity slice
export default function SmileChart({ data, maturityLabel, height = 340 }) {
  if (!data || data.length === 0) {
    return <p className="chart-empty">No data for this maturity slice.</p>;
  }

  return (
    <div className="chart-wrap" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid stroke="#2A2A3A" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="strike"
            stroke="#7A7059"
            tick={{ fill: '#B3A688', fontSize: 10, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(v) => Number(v).toFixed(1)}
            interval="preserveStartEnd"
            angle={-35}
            textAnchor="end"
            height={48}
            tickMargin={8}
          />
          <YAxis
            stroke="#7A7059"
            tick={{ fill: '#B3A688', fontSize: 10, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            label={{ value: 'Implied Vol', angle: -90, position: 'insideLeft', fill: '#B3A688', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ background: '#1C1C28', border: '1px solid #3D3D52', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
            labelStyle={{ color: '#D4A820' }}
            formatter={(value) => [`${(Number(value) * 100).toFixed(3)}%`, 'Implied Vol']}
            labelFormatter={(v) => `Strike ${Number(v).toFixed(2)}`}
          />
          <Line
            type="monotone"
            dataKey="iv"
            stroke="#C49A1E"
            strokeWidth={2}
            dot={{ r: 3, fill: '#C49A1E', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {maturityLabel && <p className="chart-caption">Maturity slice: {maturityLabel}</p>}
    </div>
  );
}
