import React, { useState, useMemo, useEffect } from 'react';
import ResultPlaceholder from '../components/ResultPlaceholder';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import DualRangeSlider from '../components/DualRangeSlider';
import PricingHeatmaps from '../components/PricingHeatmaps';
import GreeksTable from '../components/GreeksTable';
import ParityBadge from '../components/ParityBadge';
import { API_BASE } from '../config';
import { computeProportionalBounds, computeStep } from '../utils/rangeUtils';
import './Page.css';

const INITIAL = { S_0: 100, K: 100, T: 1, r: 0.05, sigma: 0.2, q: 0 };
const RANGE_PCT = 0.15;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  return (
    <PageShell
      title="Black–Scholes–Merton"
      description="Price European options with the Black–Scholes–Merton formula."
    >
      <form className="panel workspace-input" onSubmit={handleSubmit}>
        <div className="panel-header">
          <h2 className="panel-label">Parameters</h2>
        </div>
        <div className="input-grid">
          <InputField label="Spot price" name="S_0" value={params.S_0} onChange={handleChange} hint="S₀" />
          <InputField label="Strike price" name="K" value={params.K} onChange={handleChange} hint="K" />
          <InputField label="Maturity" name="T" value={params.T} onChange={handleChange} hint="years" />
          <InputField label="Risk-free rate" name="r" value={params.r} onChange={handleChange} hint="decimal" />
          <InputField label="Volatility" name="sigma" value={params.sigma} onChange={handleChange} hint="decimal" />
          <InputField label="Dividend / foreign rate" name="q" value={params.q} onChange={handleChange} hint="decimal" />
        </div>

        <div className="slider-grid" role="group" aria-label="Heatmap ranges">
          <DualRangeSlider
            label="Spot range"
            min={spotBounds.min} max={spotBounds.max} step={spotStep} decimals={2}
            valueMin={range.minSpot} valueMax={range.maxSpot}
            onChange={(mn, mx) => setRange((r) => ({ ...r, minSpot: mn, maxSpot: mx }))}
          />
          <DualRangeSlider
            label="Volatility range"
            min={volBounds.min} max={volBounds.max} step={volStep} decimals={4}
            valueMin={range.minVol} valueMax={range.maxVol}
            onChange={(mn, mx) => setRange((r) => ({ ...r, minVol: mn, maxVol: mx }))}
          />
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Computing…' : 'Price options'}
        </button>
        {error && <p className="error-msg" role="alert">{error}</p>}
      </form>

      {!results && <ResultPlaceholder loading={loading} prompt="Price options to see premiums, Greeks, and heatmaps." />}
      {results && (
        <>
          <section className="panel workspace-result" aria-label="Option prices">
            <div className="panel-header">
              <h2 className="panel-label">Option prices</h2>
            </div>
            <div className="result-grid">
              <ResultCard label="European Call" value={results['EU Call']} highlight />
              <ResultCard label="European Put" value={results['EU Put']} highlight />
            </div>
            <div className="badge-row">
              <ParityBadge label="Parity Δ" value={results['EU Parity Discrepency']} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-label">Greeks</h2>
            </div>
            <GreeksTable results={results} />
          </section>

          <PricingHeatmaps results={results} />
        </>
      )}
    </PageShell>
  );
}
