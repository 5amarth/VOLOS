import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import DualRangeSlider from '../components/DualRangeSlider';
import Heatmap from '../components/Heatmap';
import PathsChart from '../components/PathsChart';
import { API_BASE } from '../config';
import { computeProportionalBounds, computeStep } from '../utils/rangeUtils';
import './Page.css';

const INITIAL = {
  S_0: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0, N: 252, N2: 10000,
};
const RANGE_PCT = 0.15;

const GREEK_GROUPS = [
  { label: 'Delta', callKey: 'EU Call Delta', putKey: 'EU Put Delta' },
  { label: 'Gamma', callKey: 'EU Call Gamma', putKey: 'EU Put Gamma' },
  { label: 'Vega',  callKey: 'EU Call Vega',  putKey: 'EU Put Vega'  },
  { label: 'Theta', callKey: 'EU Call Theta', putKey: 'EU Put Theta' },
  { label: 'Rho',   callKey: 'EU Call Rho',   putKey: 'EU Put Rho'   },
];

const HEATMAP_OPTIONS = ['EU Call', 'EU Put'];
const HEATMAP_METRICS = ['Price', 'Profit'];

export default function MonteCarlo() {
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
        N: params.N, N2: params.N2,
        min_spot_price: range.minSpot, max_spot_price: range.maxSpot,
        min_vol: range.minVol, max_vol: range.maxVol,
      });
      const res = await fetch(`${API_BASE}/monte_carlo?${q}`);
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
      title="Monte Carlo Simulation"
      epigraph="Ten thousand futures cast like bones — the price emerges from the dust of their average."
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
          <InputField label="Time Steps" name="N" value={params.N} onChange={handleChange} hint="per path" step="1" min="1" />
          <InputField label="Simulations" name="N2" value={params.N2} onChange={handleChange} hint="paths" step="1" min="2" />
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
          {loading ? <span className="btn-loading">Simulating…</span> : 'Run Simulation'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </section>

      {results && (
        <>
          <section className="panel">
            <div className="panel-header">
              <span className="panel-label">Option Prices</span>
              <span className="panel-meta">{Number(params.N2).toLocaleString()} paths · {params.N} steps</span>
            </div>
            <div className="result-grid result-grid--2" style={{ marginBottom: '0.5rem' }}>
              <ResultCard label="Call Price" value={results['EU Call']} highlight sub={`± ${Number(results['Call Error']).toFixed(6)} std. error`} />
              <ResultCard label="Put Price"  value={results['EU Put']}  highlight sub={`± ${Number(results['Put Error']).toFixed(6)} std. error`} />
            </div>
            <div className="ci-row">
              <span className="ci-label">95% CI Call</span>
              <span className="ci-bracket">[</span>
              <span className="ci-value">{Number(results['Call CI Lower']).toFixed(6)}</span>
              <span className="ci-bracket">,</span>
              <span className="ci-value">{Number(results['Call CI Upper']).toFixed(6)}</span>
              <span className="ci-bracket">]</span>
            </div>
            <div className="ci-row">
              <span className="ci-label">95% CI Put</span>
              <span className="ci-bracket">[</span>
              <span className="ci-value">{Number(results['Put CI Lower']).toFixed(6)}</span>
              <span className="ci-bracket">,</span>
              <span className="ci-value">{Number(results['Put CI Upper']).toFixed(6)}</span>
              <span className="ci-bracket">]</span>
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
                  <span className="greeks-value">
                    {results[group.callKey] !== undefined
                      ? isNaN(results[group.callKey]) ? 'N/A' : Number(results[group.callKey]).toFixed(6)
                      : '—'}
                  </span>
                  <span className="greeks-value">
                    {results[group.putKey] !== undefined
                      ? isNaN(results[group.putKey]) ? 'N/A' : Number(results[group.putKey]).toFixed(6)
                      : '—'}
                  </span>
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

          <section className="panel">
            <div className="panel-header">
              <span className="panel-label">Sample Paths</span>
              <span className="panel-meta">first {results['Sample Paths']?.length ?? 0} of {Number(params.N2).toLocaleString()} simulations</span>
            </div>
            <PathsChart
              paths={results['Sample Paths']}
              S_0={Number(params.S_0)}
              T={Number(params.T)}
            />
          </section>
        </>
      )}
    </PageShell>
  );
}
