import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import DualRangeSlider from '../components/DualRangeSlider';
import Heatmap from '../components/Heatmap';
import ParityBadge from '../components/ParityBadge';
import { API_BASE } from '../config';
import { computeProportionalBounds, computeStep } from '../utils/rangeUtils';
import './Page.css';

const INITIAL = { S_0: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0 };
const RANGE_PCT = 0.15;

const GREEK_GROUPS = [
  { label: 'Delta', keys: ['EU Call Delta', 'EU Put Delta'] },
  { label: 'Gamma', keys: ['EU Call Gamma', 'EU Put Gamma'] },
  { label: 'Vega',  keys: ['EU Call Vega',  'EU Put Vega']  },
  { label: 'Theta', keys: ['EU Call Theta', 'EU Put Theta'] },
  { label: 'Rho',   keys: ['EU Call Rho',   'EU Put Rho']   },
];

const HEATMAP_OPTIONS = ['EU Call', 'EU Put'];
const HEATMAP_METRICS = ['Price', 'Profit'];

export default function BlackScholes() {
  const [params, setParams] = useState(INITIAL);

  const spotBounds = useMemo(
    () => computeProportionalBounds(params.S_0, RANGE_PCT, 50, 150, 2),
    [params.S_0]
  );
  const volBounds = useMemo(
    () => computeProportionalBounds(params.sigma, RANGE_PCT, 0.05, 0.6, 4),
    [params.sigma]
  );
  const spotStep = useMemo(() => computeStep(spotBounds.min, spotBounds.max, 150, 0.01), [spotBounds]);
  const volStep = useMemo(() => computeStep(volBounds.min, volBounds.max, 150, 0.0005), [volBounds]);

  const [range, setRange] = useState({
    minSpot: spotBounds.min, maxSpot: spotBounds.max,
    minVol: volBounds.min, maxVol: volBounds.max,
  });

  useEffect(() => {
    setRange((r) => ({ ...r, minSpot: spotBounds.min, maxSpot: spotBounds.max }));
  }, [spotBounds.min, spotBounds.max]);

  useEffect(() => {
    setRange((r) => ({ ...r, minVol: volBounds.min, maxVol: volBounds.max }));
  }, [volBounds.min, volBounds.max]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showHeatmaps, setShowHeatmaps] = useState(false);
  const [heatmapOption, setHeatmapOption] = useState('EU Call');
  const [heatmapMetric, setHeatmapMetric] = useState('Price');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        S_0: params.S_0, K: params.K, T: params.T,
        r: params.r, sigma: params.sigma, q: params.q,
        min_spot_price: range.minSpot, max_spot_price: range.maxSpot,
        min_vol: range.minVol, max_vol: range.maxVol,
      });
      const res = await fetch(`${API_BASE}/black_scholes_merton?${q}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const heatmapKey = `${heatmapOption} ${heatmapMetric} Heatmap`;

  return (
    <PageShell
      title="Black–Scholes–Merton"
      epigraph="The closed-form solution — a formula etched into the foundation of modern finance, derived from the heat of diffusion itself."
    >
      <section className="panel">
        <div className="panel-header">
          <span className="panel-label">Parameters</span>
        </div>
        <div className="input-grid">
          <InputField label="Spot Price" name="S_0" value={params.S_0} onChange={handleChange} hint="S₀" />
          <InputField label="Strike Price" name="K" value={params.K} onChange={handleChange} hint="K" />
          <InputField label="Maturity" name="T" value={params.T} onChange={handleChange} hint="years" step="0.01" />
          <InputField label="Risk-Free Rate" name="r" value={params.r} onChange={handleChange} hint="e.g. 0.05" step="0.001" />
          <InputField label="Volatility" name="sigma" value={params.sigma} onChange={handleChange} hint="σ" step="0.001" />
          <InputField label="Div. Yield / Foreign Rate" name="q" value={params.q} onChange={handleChange} hint="q" step="0.001" />
        </div>

        <div className="slider-grid">
          <DualRangeSlider
            label="Heatmap Spot Range"
            min={spotBounds.min} max={spotBounds.max} step={spotStep} decimals={2}
            valueMin={range.minSpot} valueMax={range.maxSpot}
            onChange={(mn, mx) => setRange((r) => ({ ...r, minSpot: mn, maxSpot: mx }))}
          />
          <DualRangeSlider
            label="Heatmap Volatility Range"
            min={volBounds.min} max={volBounds.max} step={volStep} decimals={4}
            valueMin={range.minVol} valueMax={range.maxVol}
            onChange={(mn, mx) => setRange((r) => ({ ...r, minVol: mn, maxVol: mx }))}
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="btn-loading">Computing…</span> : 'Price Options'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </section>

      {results && (
        <>
          <section className="panel">
            <div className="panel-header panel-header--with-badges">
              <span className="panel-label">Option Prices</span>
              <div className="badge-row">
                <ParityBadge label="Parity Δ" value={results['EU Parity Discrepency']} />
              </div>
            </div>
            <div className="result-grid result-grid--2">
              <ResultCard label="European Call" value={results['EU Call']} highlight />
              <ResultCard label="European Put" value={results['EU Put']} highlight />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span className="panel-label">Greeks</span>
            </div>
            <div className="greeks-table">
              <div className="greeks-header">
                <span />
                <span className="greeks-col-label">Call</span>
                <span className="greeks-col-label">Put</span>
              </div>
              {GREEK_GROUPS.map((group) => (
                <div className="greeks-row" key={group.label}>
                  <span className="greeks-row-label">{group.label}</span>
                  {group.keys.map((k) => (
                    <span key={k} className="greeks-value">
                      {results[k] !== undefined
                        ? isNaN(results[k]) ? 'N/A' : Number(results[k]).toFixed(6)
                        : '—'}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span className="panel-label">Heatmaps</span>
              <button
                className={`section-toggle-btn ${showHeatmaps ? 'section-toggle-btn--active' : ''}`}
                onClick={() => setShowHeatmaps((s) => !s)}
              >
                <span className={`section-toggle-caret ${showHeatmaps ? 'section-toggle-caret--open' : ''}`}>&#9656;</span>
                {showHeatmaps ? 'Hide Heatmaps' : 'Show Heatmaps'}
              </button>
            </div>

            {showHeatmaps && (
              <>
                <div className="heatmap-controls">
                  <div className="heatmap-control-group">
                    <span className="heatmap-control-group-label">Option</span>
                    <div className="toggle-pills">
                      {HEATMAP_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          className={`toggle-pill ${heatmapOption === opt ? 'toggle-pill--active' : ''}`}
                          onClick={() => setHeatmapOption(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="heatmap-control-group">
                    <span className="heatmap-control-group-label">Metric</span>
                    <div className="toggle-pills">
                      {HEATMAP_METRICS.map((metric) => (
                        <button
                          key={metric}
                          className={`toggle-pill ${heatmapMetric === metric ? 'toggle-pill--active' : ''}`}
                          onClick={() => setHeatmapMetric(metric)}
                        >
                          {metric}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {results[heatmapKey] ? (
                  <Heatmap
                    matrix={results[heatmapKey]}
                    rowLabels={results['X Axis']}
                    colLabels={results['Y Axis']}
                    mode={heatmapMetric === 'Profit' ? 'profit' : 'price'}
                    rowAxisTitle="Spot Price"
                    colAxisTitle="Volatility"
                  />
                ) : (
                  <p className="panel-subtext">No heatmap data returned for this selection.</p>
                )}
              </>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
}
