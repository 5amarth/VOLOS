import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { plotlyPriceColorscale } from '../utils/colorScale';
import './VolSurfacePlot.css';

const Plot = createPlotlyComponent(Plotly);

// Z_IV_Surface[i][j] -> strike index i, maturity index j (per backend meshgrid convention)
function transposeToPlotlyZ(zGrid) {
  if (!zGrid || zGrid.length === 0) return [];
  const numRows = zGrid.length;
  const numCols = zGrid[0].length;
  const transposed = [];
  for (let j = 0; j < numCols; j++) {
    const row = [];
    for (let i = 0; i < numRows; i++) {
      row.push(zGrid[i][j]);
    }
    transposed.push(row);
  }
  return transposed;
}

export default function VolSurfacePlot({ xStrikes, yMaturities, zSurface, height = 520 }) {
  const zPlotly = useMemo(() => transposeToPlotlyZ(zSurface), [zSurface]);
  const colorscale = useMemo(() => plotlyPriceColorscale(12), []);

  const data = [
    {
      type: 'surface',
      x: xStrikes,
      y: yMaturities,
      z: zPlotly,
      colorscale,
      showscale: true,
      colorbar: {
        title: { text: 'IV', font: { color: '#f1edf6', family: 'Menlo, Consolas, monospace', size: 10 } },
        tickfont: { color: '#b5aabd', family: 'Menlo, Consolas, monospace', size: 9 },
        outlinewidth: 0,
        len: 0.7,
      },
      hovertemplate:
        'Strike: %{x:.2f}<br>Maturity: %{y:.3f}y<br>IV: %{z:.4f}<extra></extra>',
      contours: {
        z: { show: false },
      },
      lighting: { ambient: 0.65, diffuse: 0.7, specular: 0.3, roughness: 0.6 },
    },
  ];

  const layout = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#f1edf6', family: 'Avenir Next, sans-serif' },
    margin: { l: 0, r: 0, t: 10, b: 0 },
    scene: {
      bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        title: { text: 'Strike', font: { color: '#ba9aff', size: 11 } },
        color: '#b5aabd',
        gridcolor: '#2c2634',
        zerolinecolor: '#41374d',
        showbackground: false,
      },
      yaxis: {
        title: { text: 'Maturity (yrs)', font: { color: '#ba9aff', size: 11 } },
        color: '#b5aabd',
        gridcolor: '#2c2634',
        zerolinecolor: '#41374d',
        showbackground: false,
      },
      zaxis: {
        title: { text: 'Implied Vol', font: { color: '#ba9aff', size: 11 } },
        color: '#b5aabd',
        gridcolor: '#2c2634',
        zerolinecolor: '#41374d',
        showbackground: false,
      },
      camera: { eye: { x: 1.6, y: 1.6, z: 0.9 } },
    },
  };

  const config = {
    displayModeBar: false,
    responsive: true,
  };

  return (
    <div className="vol-surface-wrap" style={{ height }}>
      <Plot
        data={data}
        layout={layout}
        config={config}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
