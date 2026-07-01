import React from 'react';
import './ResultCard.css';

export default function ResultCard({ label, value, unit, sub, highlight }) {
  const displayValue = value === null || value === undefined
    ? '—'
    : typeof value === 'number'
    ? isNaN(value) ? 'N/A' : value.toFixed(6)
    : value;

  return (
    <div className={`result-card ${highlight ? 'result-card--highlight' : ''}`}>
      <span className="result-card-label">{label}</span>
      <span className="result-card-value">
        {unit && unit === '$' && <span className="result-card-unit">$</span>}
        {displayValue}
        {unit && unit !== '$' && <span className="result-card-unit">{unit}</span>}
      </span>
      {sub && <span className="result-card-sub">{sub}</span>}
    </div>
  );
}
