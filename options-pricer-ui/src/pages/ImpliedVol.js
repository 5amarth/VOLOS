import React, { useState } from 'react';
import ResultPlaceholder from '../components/ResultPlaceholder';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      setResult({ value: data, isCall: optType });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ivValue = result && (
    Number.isFinite(result.value) ? `${(result.value * 100).toFixed(4)}%` : 'No solution found'
  );

  return (
    <PageShell
      title="Implied Volatility"
      description="Find the volatility implied by a quoted option price."
    >
      <form className="panel workspace-input" onSubmit={handleSubmit}>
        <div className="panel-header">
          <h2 className="panel-label">Parameters</h2>
        </div>
        <div className="input-grid">
          <InputField label="Market price" name="p" value={params.p} onChange={handleChange} hint="p" />
          <InputField label="Spot price" name="S_0" value={params.S_0} onChange={handleChange} hint="S₀" />
          <InputField label="Strike price" name="K" value={params.K} onChange={handleChange} hint="K" />
          <InputField label="Maturity" name="T" value={params.T} onChange={handleChange} hint="years" />
          <InputField label="Risk-free rate" name="r" value={params.r} onChange={handleChange} hint="decimal" />
          <InputField label="Dividend / foreign rate" name="q" value={params.q} onChange={handleChange} hint="decimal" />
        </div>

        <div className="toggle-group" role="group" aria-label="Option type">
          <span className="toggle-label" aria-hidden="true">Option type</span>
          <div className="toggle-pills">
            <button
              type="button" className="toggle-pill" aria-pressed={optType === true}
              onClick={() => setOptType(true)}
            >
              Call
            </button>
            <button
              type="button" className="toggle-pill" aria-pressed={optType === false}
              onClick={() => setOptType(false)}
            >
              Put
            </button>
          </div>
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Solving…' : 'Solve for IV'}
        </button>
        {error && <p className="error-msg" role="alert">{error}</p>}
      </form>

      {!result && <ResultPlaceholder loading={loading} prompt="Solve for the volatility implied by your inputs." />}
      {ivValue !== null && (
        <section className="panel workspace-result" aria-label="Implied volatility result">
          <div className="panel-header">
            <h2 className="panel-label">Result</h2>
          </div>
            <div className="iv-result-card">
              <span className="iv-result-label">Implied Volatility</span>
              <span className="iv-result-value">{ivValue}</span>
              <span className="iv-result-type">{result.isCall ? 'Call' : 'Put'} option</span>
          </div>
        </section>
      )}
    </PageShell>
  );
}
