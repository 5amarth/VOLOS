import React, { useMemo, useState } from 'react';
import ResultPlaceholder from '../components/ResultPlaceholder';
import PageShell from '../components/PageShell';
import InputField from '../components/InputField';
import ManualDataTable, { makeEmptyRow } from '../components/ManualDataTable';
import FileUploadZone from '../components/FileUploadZone';
import VolSurfacePlot from '../components/VolSurfacePlot';
import SmileChart from '../components/SmileChart';
import { API_BASE } from '../config';
import './Page.css';

const INITIAL = { S_0: 100, r: 0.05, q: 0, grid_resolution: 25 };

export default function VolSurface() {
  const [params, setParams] = useState(INITIAL);
  const [mode, setMode] = useState('manual'); // 'manual' | 'upload'
  const [manualRows, setManualRows] = useState(() => [makeEmptyRow(), makeEmptyRow(), makeEmptyRow(), makeEmptyRow()]);
  const [uploadedMatrix, setUploadedMatrix] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maturityIndex, setMaturityIndex] = useState(0);

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams((p) => ({ ...p, [name]: value }));
  };

  const buildManualMatrix = () => {
    const matrix = [];
    for (const row of manualRows) {
      if (row.price === '' || row.strike === '' || row.maturity === '') continue;
      const price = Number(row.price);
      const strike = Number(row.strike);
      const maturity = Number(row.maturity);
      const type = Number(row.type);
      if (![price, strike, maturity].every(Number.isFinite)) continue;
      matrix.push([price, strike, maturity, type]);
    }
    return matrix;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const matrix = mode === 'manual' ? buildManualMatrix() : uploadedMatrix;

    if (matrix.length === 0) {
      setError('No valid rows to submit. Add data manually or upload a file.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/IV_interpolator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          S_0: Number(params.S_0),
          r: Number(params.r),
          q: Number(params.q),
          grid_resolution: Number(params.grid_resolution),
          market_data_matrix: matrix,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResults(data);
      setMaturityIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const smileData = useMemo(() => {
    if (!results || !results.X_Strikes || !results.Z_IV_Surface) return [];
    return results.X_Strikes.map((strike, i) => ({
      strike,
      iv: results.Z_IV_Surface[i][maturityIndex],
    }));
  }, [results, maturityIndex]);

  const maturityLabel = results?.Y_Maturities
    ? `${results.Y_Maturities[maturityIndex].toFixed(4)} yrs`
    : null;

  return (
    <PageShell
      title="IV Interpolator"
      description="Build an implied-volatility surface from out-of-the-money option quotes."
    >
      <form className="workspace-input" onSubmit={handleSubmit}>
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-label">Market parameters</h2>
          </div>
          <div className="input-grid">
            <InputField label="Spot price" name="S_0" value={params.S_0} onChange={handleParamChange} hint="S₀" />
            <InputField label="Risk-free rate" name="r" value={params.r} onChange={handleParamChange} hint="decimal" />
            <InputField label="Dividend / foreign rate" name="q" value={params.q} onChange={handleParamChange} hint="decimal" />
            <InputField label="Grid resolution" name="grid_resolution" value={params.grid_resolution} onChange={handleParamChange} hint="integer" step="1" min="2" />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-label">Option quotes</h2>
          </div>
          <p className="panel-subtext">Use out-of-the-money quotes across several strikes and maturities.</p>

          <div className="mode-toggle-wrap">
            <div className="toggle-pills" role="group" aria-label="Data input method">
              <button
                type="button" className="toggle-pill" aria-pressed={mode === 'manual'}
                onClick={() => setMode('manual')}
              >
                Manual entry
              </button>
              <button
                type="button" className="toggle-pill" aria-pressed={mode === 'upload'}
                onClick={() => setMode('upload')}
              >
                File upload
              </button>
            </div>
          </div>

          {mode === 'manual' && <ManualDataTable rows={manualRows} onChange={setManualRows} />}
          <div hidden={mode !== 'upload'}>
            <FileUploadZone onParsed={setUploadedMatrix} />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Interpolating…' : 'Build surface'}
          </button>
          {error && <p className="error-msg" role="alert">{error}</p>}
        </section>
      </form>

      {!results && <ResultPlaceholder loading={loading} prompt="Add option quotes and build the surface to see the results." />}
      {results && (
        <>
          <section className="panel workspace-result" aria-label="Surface coverage">
            <div className="panel-header"><h2 className="panel-label">Surface coverage</h2></div>
            <div className="result-grid">
              <div className="result-card">
                <span className="result-card-label">Strike range</span>
                <span className="result-card-value">{results.X_Strikes[0].toFixed(2)}–{results.X_Strikes.at(-1).toFixed(2)}</span>
              </div>
              <div className="result-card">
                <span className="result-card-label">Maturity range</span>
                <span className="result-card-value">{results.Y_Maturities[0].toFixed(2)}–{results.Y_Maturities.at(-1).toFixed(2)} yr</span>
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-label">Implied volatility surface</h2>
              <span className="panel-meta">{results.X_Strikes.length}×{results.Y_Maturities.length} grid</span>
            </div>
            <VolSurfacePlot
              xStrikes={results.X_Strikes}
              yMaturities={results.Y_Maturities}
              zSurface={results.Z_IV_Surface}
            />
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-label">Volatility smile</h2>
            </div>
            <div className="input-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="input-field">
                <label className="input-label" htmlFor="maturity-slice">
                  <span className="input-label-text">Maturity Slice</span>
                  <span className="input-hint">T</span>
                </label>
                <select
                  id="maturity-slice"
                  className="manual-table-select"
                  value={maturityIndex}
                  onChange={(e) => setMaturityIndex(Number(e.target.value))}
                >
                  {results.Y_Maturities.map((t, idx) => (
                    <option key={idx} value={idx}>
                      {t.toFixed(4)} yrs
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <SmileChart data={smileData} maturityLabel={maturityLabel} />
          </section>
        </>
      )}
    </PageShell>
  );
}
