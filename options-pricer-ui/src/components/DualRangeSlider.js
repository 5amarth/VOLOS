import React from 'react';
import './DualRangeSlider.css';

export default function DualRangeSlider({ label, min, max, step, valueMin, valueMax, onChange, unit = '', decimals = 2 }) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  const handleMinChange = (e) => {
    const next = Math.min(Number(e.target.value), valueMax - step);
    onChange(next, valueMax);
  };

  const handleMaxChange = (e) => {
    const next = Math.max(Number(e.target.value), valueMin + step);
    onChange(valueMin, next);
  };

  return (
    <div className="dual-slider">
      <div className="dual-slider-header">
        <span className="dual-slider-label">{label}</span>
        <span className="dual-slider-values">
          {valueMin.toFixed(decimals)}{unit} &ndash; {valueMax.toFixed(decimals)}{unit}
        </span>
      </div>
      <div className="dual-slider-track-wrap">
        <div className="dual-slider-rail" />
        <div
          className="dual-slider-fill"
          style={{ left: `${pctMin}%`, width: `${Math.max(0, pctMax - pctMin)}%` }}
        />
        <input
          type="range"
          className="dual-slider-input"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMinChange}
          aria-label={`${label} minimum`}
        />
        <input
          type="range"
          className="dual-slider-input"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMaxChange}
          aria-label={`${label} maximum`}
        />
      </div>
    </div>
  );
}
