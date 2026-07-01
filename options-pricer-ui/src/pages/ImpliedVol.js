import React, { useState } from 'react';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import { API_BASE } from '../config';
import './Page.css';

const INITIAL = { p: 10, S_0: 100, K: 100, T: 1, r: 0.05, q: 0 };

export default function ImpliedVol() {
  const [params, setParams] = useState(INITIAL);
  const [optType, setOptType] = useState(true); // true = call
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        p: params.p, S_0: params.S_0, K: params.K,
        T: params.T, r: params.r, q: params.q, type: optType,
      });
      const res = await fetch(`${API_BASE}/implied_volatility?${q}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ivValue = result !== null && result !== undefined
    ? typeof result === 'number'
      ? isNaN(result) ? 'No solution found' : `${(result * 100).toFixed(4)}%`
      : result
    : null;

  return (
    <PageShell
      title="Implied Volatility"
      epigraph="Invert the oracle — given the price the market whispers, extract the fear it conceals within."
    >
      <section className="panel">
        <div className="panel-header">
          <span className="panel-label">Parameters</span>
        </div>
        <div className="input-grid">
          <InputField label="Option Market Price" name="p" value={params.p} onChange={handleChange} hint="p" step="0.01" />
          <InputField label="Spot Price" name="S_0" value={params.S_0} onChange={handleChange} hint="S₀" />
          <InputField label="Strike Price" name="K" value={params.K} onChange={handleChange} hint="K" />
          <InputField label="Maturity" name="T" value={params.T} onChange={handleChange} hint="years" step="0.01" />
          <InputField label="Risk-Free Rate" name="r" value={params.r} onChange={handleChange} hint="e.g. 0.05" step="0.001" />
          <InputField label="Div. Yield / Foreign Rate" name="q" value={params.q} onChange={handleChange} hint="q" step="0.001" />
        </div>

        <div className="toggle-group">
          <span className="toggle-label">Option Type</span>
          <div className="toggle-pills">
            <button
              className={`toggle-pill ${optType === true ? 'toggle-pill--active' : ''}`}
              onClick={() => setOptType(true)}
            >
              Call
            </button>
            <button
              className={`toggle-pill ${optType === false ? 'toggle-pill--active' : ''}`}
              onClick={() => setOptType(false)}
            >
              Put
            </button>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="btn-loading">Solving…</span> : 'Solve for IV'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </section>

      {ivValue !== null && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-label">Result</span>
          </div>
          <div className="iv-result-wrapper">
            <div className="iv-result-card">
              <span className="iv-result-label">Implied Volatility</span>
              <span className="iv-result-value">{ivValue}</span>
              <span className="iv-result-type">{optType ? 'Call' : 'Put'} option</span>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
