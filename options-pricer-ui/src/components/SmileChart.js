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
          <CartesianGrid stroke="#2c2634" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="strike"
            stroke="#9c91a5"
            tick={{ fill: '#b5aabd', fontSize: 10, fontWeight: 500, fontFamily: 'Menlo, Consolas, monospace' }}
            tickFormatter={(v) => Number(v).toFixed(1)}
            interval="preserveStartEnd"
            angle={-35}
            textAnchor="end"
            height={48}
            tickMargin={8}
          />
          <YAxis
            stroke="#9c91a5"
            tick={{ fill: '#b5aabd', fontSize: 10, fontWeight: 500, fontFamily: 'Menlo, Consolas, monospace' }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            label={{ value: 'Implied Vol', angle: -90, position: 'insideLeft', fill: '#b5aabd', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ background: '#1c1724', border: '1px solid #41374d', fontFamily: 'Menlo, Consolas, monospace', fontSize: '11px' }}
            labelStyle={{ color: '#ba9aff' }}
            formatter={(value) => [`${(Number(value) * 100).toFixed(3)}%`, 'Implied Vol']}
            labelFormatter={(v) => `Strike ${Number(v).toFixed(2)}`}
          />
          <Line
            type="monotone"
            dataKey="iv"
            stroke="#ba9aff"
            strokeWidth={2}
            dot={{ r: 3, fill: '#ba9aff', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {maturityLabel && <p className="chart-caption">Maturity slice: {maturityLabel}</p>}
    </div>
  );
}
