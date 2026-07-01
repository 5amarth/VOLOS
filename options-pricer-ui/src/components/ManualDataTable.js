import React from 'react';
import './ManualDataTable.css';

let rowIdCounter = 0;
const nextRowId = () => `row_${rowIdCounter++}`;

export function makeEmptyRow() {
  return { id: nextRowId(), price: '', strike: '', maturity: '', type: '0' };
}

export default function ManualDataTable({ rows, onChange }) {
  const updateRow = (id, field, value) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (id) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const addRow = () => {
    onChange([...rows, makeEmptyRow()]);
  };

  return (
    <div className="manual-table-wrap">
      <div className="manual-table">
        <div className="manual-table-header">
          <span>Option Price</span>
          <span>Strike</span>
          <span>Maturity (yrs)</span>
          <span>Type</span>
          <span />
        </div>
        {rows.map((row) => (
          <div className="manual-table-row" key={row.id}>
            <input
              className="manual-table-input"
              type="number"
              step="any"
              placeholder="12.50"
              value={row.price}
              onChange={(e) => updateRow(row.id, 'price', e.target.value)}
            />
            <input
              className="manual-table-input"
              type="number"
              step="any"
              placeholder="105"
              value={row.strike}
              onChange={(e) => updateRow(row.id, 'strike', e.target.value)}
            />
            <input
              className="manual-table-input"
              type="number"
              step="any"
              placeholder="0.50"
              value={row.maturity}
              onChange={(e) => updateRow(row.id, 'maturity', e.target.value)}
            />
            <select
              className="manual-table-select"
              value={row.type}
              onChange={(e) => updateRow(row.id, 'type', e.target.value)}
            >
              <option value="0">Call</option>
              <option value="1">Put</option>
            </select>
            <button
              className="manual-table-remove"
              onClick={() => removeRow(row.id)}
              aria-label="Remove row"
              type="button"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <button className="manual-table-add" onClick={addRow} type="button">
        + Add Row
      </button>
    </div>
  );
}
