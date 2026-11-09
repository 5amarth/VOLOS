import React from 'react';
import './InputField.css';

export default function InputField({ label, name, value, onChange, hint, type = 'number', step, min, max, placeholder }) {
  return (
    <div className="input-field">
      <label className="input-label" htmlFor={name}>
        <span className="input-label-text">{label}</span>
        {hint && <span className="input-hint">{hint}</span>}
      </label>
      <input
        className="input-control"
        id={name}
        name={name}
        type={type}
        step={step ?? 'any'}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? ''}
        required
        autoComplete="off"
      />
    </div>
  );
}
