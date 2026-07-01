import React from 'react';
import './ParityBadge.css';

const SIGNIFICANCE_THRESHOLD = 0.1;

export default function ParityBadge({ label, value }) {
  if (value === null || value === undefined || isNaN(value)) return null;
  const isSignificant = Math.abs(value) > SIGNIFICANCE_THRESHOLD;

  return (
    <div className={`parity-badge ${isSignificant ? 'parity-badge--warn' : 'parity-badge--ok'}`}>
      <span className="parity-badge-dot" />
      <span className="parity-badge-label">{label}</span>
      <span className="parity-badge-value">{value.toFixed(4)}</span>
    </div>
  );
}
