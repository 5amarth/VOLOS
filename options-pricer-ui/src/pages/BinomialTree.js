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

const INITIAL = {
  S_0: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0, N: 100,
};

// Heatmap axis bounds default to +/-15% around the live spot price / volatility,
// re-derived below whenever those inputs change, so the grid stays within a
// realistic window instead of sweeping into extreme, meaningless corner values.
const RANGE_PCT = 0.15;

const GREEK_KEYS = ['Delta', 'Gamma', 'Vega', 'Theta', 'Rho'];
const HEATMAP_OPTIONS = ['EU Call', 'EU Put', 'AM Call', 'AM Put'];
const HEATMAP_METRICS = ['Price', 'Profit'];

export default function BinomialTree() {
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

  // Keep the slider's own bounds (and the selected sub-range) tracking the
  // live Spot Price / Volatility fields above.
  useEffect(() => {
    setRange((r) => ({ ...r, minSpot: spotBounds.min, maxSpot: spotBounds.max }));
  }, [spotBounds.min, spotBounds.max]);

  useEffect(() => {
    setRange((r) => ({ ...r, minVol: volBounds.min, maxVol: volBounds.max }));
  }, [volBounds.min, volBounds.max]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [greekStyle, setGreekStyle] = useState('EU'); // 'EU' | 'AM'
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
        r: params.r, sigma: params.sigma, q: params.q, N: params.N,
        min_spot_price: range.minSpot, max_spot_price: range.maxSpot,
        min_vol: range.minVol, max_vol: range.maxVol,
      });
      const res = await fetch(`${API_BASE}/binomial_tree?${q}`);
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
      title="Binomial Tree Model"
      epigraph="A lattice of futures, branching at each step — every node a reckoning between ascent and fall."
    >
      {/* Inputs */}
      <section className="panel">
        <div className="panel-header">
          <span className="panel-label">Parameters</span>
        </div>
        <div className="input-grid">
          <InputField label="Spot Price" name="S_0" value={params.S_0} onChange={handleChange} hint="S₀" placeholder="100" />
          <InputField label="Strike Price" name="K" value={params.K} onChange={handleChange} hint="K" placeholder="100" />
          <InputField label="Maturity" name="T" value={params.T} onChange={handleChange} hint="years" placeholder="1.0" step="0.01" />
          <InputField label="Risk-Free Rate" name="r" value={params.r} onChange={handleChange} hint="e.g. 0.05" step="0.001" placeholder="0.05" />
          <InputField label="Volatility" name="sigma" value={params.sigma} onChange={handleChange} hint="σ" step="0.001" placeholder="0.20" />
          <InputField label="Div. Yield / Foreign Rate" name="q" value={params.q} onChange={handleChange} hint="q" step="0.001" placeholder="0.00" />
          <InputField label="Steps" name="N" value={params.N} onChange={handleChange} hint="integer" step="1" min="2" placeholder="100" />
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
          {loading ? <span className="btn-loading">Pricing…</span> : 'Price Options'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </section>

      {/* Results */}
      {results && (
        <>
          <section className="panel">
            <div className="panel-header panel-header--with-badges">
              <span className="panel-label">Option Prices</span>
              <div className="badge-row">
                <ParityBadge label="EU Parity Δ" value={results['EU Parity Discrepency']} />
                <ParityBadge label="AM Parity Δ" value={results['AM Parity Discrepency']} />
              </div>
            </div>
            <div className="result-grid result-grid--4">
              <ResultCard label="European Call" value={results['EU Call']} highlight />
              <ResultCard label="European Put" value={results['EU Put']} highlight />
              <ResultCard label="American Call" value={results['AM Call']} />
              <ResultCard label="American Put" value={results['AM Put']} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <span className="panel-label">Greeks</span>
              <div className="toggle-pills">
                <button
                  className={`toggle-pill ${greekStyle === 'EU' ? 'toggle-pill--active' : ''}`}
                  onClick={() => setGreekStyle('EU')}
                >
                  European
                </button>
                <button
                  className={`toggle-pill ${greekStyle === 'AM' ? 'toggle-pill--active' : ''}`}
                  onClick={() => setGreekStyle('AM')}
                >
                  American
                </button>
              </div>
            </div>
            <div className="result-grid result-grid--4">
              {GREEK_KEYS.map((greek) => (
                <ResultCard
                  key={greek}
                  label={`${greekStyle} Call ${greek}`}
                  value={results[`${greekStyle} Call ${greek}`]}
                />
              ))}
              {GREEK_KEYS.map((greek) => (
                <ResultCard
                  key={`${greek}-put`}
                  label={`${greekStyle} Put ${greek}`}
                  value={results[`${greekStyle} Put ${greek}`]}
                />
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
