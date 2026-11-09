import React from 'react';
import './ManualDataTable.css';

let rowIdCounter = 0;
const nextRowId = () => `row_${rowIdCounter++}`;

const FIELDS = [
  { name: 'price', label: 'Option price', placeholder: '12.50' },
  { name: 'strike', label: 'Strike', placeholder: '105' },
  { name: 'maturity', label: 'Maturity (yrs)', placeholder: '0.50' },
];

export function makeEmptyRow() {
  return { id: nextRowId(), price: '', strike: '', maturity: '', type: '0' };
}

export default function ManualDataTable({ rows, onChange }) {
  const updateRow = (id, field, value) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="manual-table-wrap">
      <div className="manual-table-header" aria-hidden="true">
        {FIELDS.map(({ name, label }) => <span key={name}>{label}</span>)}
        <span>Type</span>
      </div>
      {rows.map((row, index) => (
        <div className="manual-table-row" key={row.id}>
          {FIELDS.map(({ name, label, placeholder }) => (
            <label className="manual-table-cell" key={name}>
              <span className="manual-table-mobile-label" aria-hidden="true">{label}</span>
              <input
                className="manual-table-input"
                type="number"
                step="any"
                placeholder={placeholder}
                value={row[name]}
                aria-label={`Row ${index + 1}, ${label}`}
                onChange={(event) => updateRow(row.id, name, event.target.value)}
              />
            </label>
          ))}
          <label className="manual-table-cell">
            <span className="manual-table-mobile-label" aria-hidden="true">Type</span>
            <select
              className="manual-table-select"
              value={row.type}
              aria-label={`Row ${index + 1}, option type`}
              onChange={(event) => updateRow(row.id, 'type', event.target.value)}
            >
              <option value="0">Call</option>
              <option value="1">Put</option>
            </select>
          </label>
          <button
            className="manual-table-remove"
            onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
            aria-label={`Remove row ${index + 1}`}
            type="button"
          >
            &times;
          </button>
        </div>
      ))}
      <button className="manual-table-add" onClick={() => onChange([...rows, makeEmptyRow()])} type="button">
        + Add row
      </button>
    </div>
  );
}
