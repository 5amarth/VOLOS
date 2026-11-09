import React from 'react';

const GREEKS = ['Delta', 'Gamma', 'Vega', 'Theta', 'Rho'];

function formatGreek(value) {
  if (value == null) return '—';
  return Number.isFinite(Number(value)) ? Number(value).toFixed(6) : 'N/A';
}

export default function GreeksTable({ results, style = 'EU' }) {
  return (
    <table className="greeks-table" aria-label={style === 'EU' ? 'European option Greeks' : 'American option Greeks'}>
      <thead>
        <tr><th scope="col">Greek</th><th scope="col">Call</th><th scope="col">Put</th></tr>
      </thead>
      <tbody>
        {GREEKS.map((greek) => (
          <tr key={greek}>
            <th scope="row">{greek}</th>
            <td>{formatGreek(results[`${style} Call ${greek}`])}</td>
            <td>{formatGreek(results[`${style} Put ${greek}`])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
