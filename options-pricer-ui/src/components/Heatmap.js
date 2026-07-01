import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { matrixMinMax, buildPriceRanges, buildProfitRanges } from '../utils/colorScale';
import './Heatmap.css';

// matrix: 2D array, matrix[i][j] -> row i, col j
// rowLabels / colLabels: arrays of numbers to label rows/cols
// mode: 'price' | 'profit'
export default function Heatmap({ matrix, rowLabels, colLabels, mode, rowAxisTitle, colAxisTitle, height = 380 }) {
  const { series, ranges } = useMemo(() => {
    const { min, max } = matrixMinMax(matrix);
    const colorRanges = mode === 'profit' ? buildProfitRanges(min, max) : buildPriceRanges(min, max);

    const seriesData = matrix.map((row, i) => ({
      name: rowLabels[i] !== undefined ? rowLabels[i].toFixed(2) : `${i}`,
      data: row.map((value, j) => ({
        x: colLabels[j] !== undefined ? colLabels[j].toFixed(3) : `${j}`,
        y: Number(value.toFixed(4)),
      })),
    }));

    return { series: seriesData, ranges: colorRanges };
  }, [matrix, rowLabels, colLabels, mode]);

  const options = useMemo(() => ({
    chart: {
      type: 'heatmap',
      background: 'transparent',
      foreColor: '#9A8E72',
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
      style: { fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, colors: ['#0A0A0F'] },
      formatter: (val) => Number(val).toFixed(2),
    },
    stroke: {
      width: 1,
      colors: ['#0A0A0F'],
    },
    grid: {
      show: false,
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
    },
    xaxis: {
      title: {
        text: colAxisTitle,
        style: { color: '#9A8E72', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' },
      },
      labels: {
        style: { colors: '#9A8E72', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' },
        rotate: -45,
      },
      axisBorder: { color: '#2A2A3A' },
      axisTicks: { color: '#2A2A3A' },
    },
    yaxis: {
      title: {
        text: rowAxisTitle,
        style: { color: '#9A8E72', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' },
      },
      labels: {
        style: { colors: '#9A8E72', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px' },
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '9px',
      labels: { colors: '#9A8E72' },
      itemMargin: { horizontal: 4, vertical: 4 },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => Number(val).toFixed(6) },
    },
  }), [ranges, rowAxisTitle, colAxisTitle]);

  return (
    <div className="heatmap-wrap">
      <Chart options={options} series={series} type="heatmap" height={height} />
    </div>
  );
}
