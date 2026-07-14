import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import {
  matrixMinMax, buildPriceRanges, buildProfitRanges, priceGradientCSS, profitGradientCSS,
} from '../utils/colorScale';
import './Heatmap.css';

// matrix: 2D array, matrix[i][j] -> row i, col j
// rowLabels / colLabels: arrays of numbers to label rows/cols
// mode: 'price' | 'profit'
export default function Heatmap({ matrix, rowLabels, colLabels, mode, rowAxisTitle, colAxisTitle, height = 460 }) {
  const { series, ranges, min, max } = useMemo(() => {
    const { min, max } = matrixMinMax(matrix);
    const colorRanges = mode === 'profit' ? buildProfitRanges(min, max) : buildPriceRanges(min, max);

    const seriesData = matrix.map((row, i) => ({
      name: rowLabels[i] !== undefined ? rowLabels[i].toFixed(2) : `${i}`,
      data: row.map((value, j) => ({
        x: colLabels[j] !== undefined ? colLabels[j].toFixed(3) : `${j}`,
        y: Number(value.toFixed(4)),
      })),
    }));

    return { series: seriesData, ranges: colorRanges, min, max };
  }, [matrix, rowLabels, colLabels, mode]);

  const gradientCSS = useMemo(
    () => (mode === 'profit' ? profitGradientCSS() : priceGradientCSS()),
    [mode]
  );

  const options = useMemo(() => ({
    chart: {
      type: 'heatmap',
      background: 'transparent',
      foreColor: '#B3A688',
      toolbar: { show: false },
      animations: { enabled: false },
    },
    theme: { mode: 'dark' },
    plotOptions: {
      heatmap: {
        enableShades: false,
        colorScale: { ranges },
      },
    },
    dataLabels: {
      enabled: true,
      // Light, bold text with a soft shadow (see .heatmap-wrap CSS) reads cleanly
      // against every cell color in the ramp, without a boxed/bordered look.
      style: { fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, colors: ['#F5F0E4'] },
      formatter: (val) => Number(val).toFixed(2),
    },
    stroke: {
      width: 0,
    },
    grid: {
      show: false,
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
    },
    xaxis: {
      title: {
        text: colAxisTitle,
        style: { color: '#B3A688', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 },
      },
      labels: {
        style: { colors: '#B3A688', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 500 },
        rotate: -45,
      },
      axisBorder: { color: '#2A2A3A' },
      axisTicks: { color: '#2A2A3A' },
    },
    yaxis: {
      title: {
        text: rowAxisTitle,
        style: { color: '#B3A688', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 },
      },
      labels: {
        style: { colors: '#B3A688', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 500 },
      },
    },
    // The built-in per-range legend produced a cluttered, variable-height wall of
    // swatches. A single compact gradient bar (below) replaces it consistently.
    legend: { show: false },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => Number(val).toFixed(6) },
    },
  }), [ranges, rowAxisTitle, colAxisTitle]);

  return (
    <div className="heatmap-wrap">
      <Chart options={options} series={series} type="heatmap" height={height} />
      <div className="heatmap-legend">
        <div className="heatmap-legend-bar" style={{ background: gradientCSS }} />
        <div className="heatmap-legend-labels">
          <span className="heatmap-legend-label">
            {mode === 'profit' ? `${min.toFixed(2)} loss` : min.toFixed(2)}
          </span>
          {mode === 'profit' && <span className="heatmap-legend-label heatmap-legend-label--mid">0</span>}
          <span className="heatmap-legend-label">
            {mode === 'profit' ? `${max.toFixed(2)} gain` : max.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
