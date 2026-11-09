import React, { useState } from 'react';
import Heatmap from './Heatmap';

const METRICS = ['Price', 'Profit'];
const EUROPEAN_OPTIONS = ['EU Call', 'EU Put'];
const AMERICAN_OPTIONS = [...EUROPEAN_OPTIONS, 'AM Call', 'AM Put'];

export default function PricingHeatmaps({ results, includeAmerican = false }) {
  const [open, setOpen] = useState(true);
  const [option, setOption] = useState('EU Call');
  const [metric, setMetric] = useState('Price');
  const options = includeAmerican ? AMERICAN_OPTIONS : EUROPEAN_OPTIONS;
  const matrix = results[`${option} ${metric} Heatmap`];

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-label">Heatmaps</h2>
        <button type="button" className="section-toggle-btn" aria-expanded={open} aria-controls="pricing-heatmaps" onClick={() => setOpen(!open)}>
          <span aria-hidden="true" className={open ? 'section-toggle-caret--open' : undefined}>▸</span>
          {open ? 'Hide heatmaps' : 'Show heatmaps'}
        </button>
      </div>
      <div id="pricing-heatmaps" hidden={!open}>
        {open && (
          <>
            <div className="heatmap-controls">
              <div className="heatmap-control-group" role="group" aria-label="Option">
                <span className="heatmap-control-group-label" aria-hidden="true">Option</span>
                <div className="toggle-pills">
                  {options.map((name) => (
                    <button type="button" className="toggle-pill" key={name} aria-pressed={option === name} onClick={() => setOption(name)}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="heatmap-control-group" role="group" aria-label="Metric">
                <span className="heatmap-control-group-label" aria-hidden="true">Metric</span>
                <div className="toggle-pills">
                  {METRICS.map((name) => (
                    <button type="button" className="toggle-pill" key={name} aria-pressed={metric === name} onClick={() => setMetric(name)}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {matrix ? (
              <Heatmap
                key={`${option}-${metric}`}
                matrix={matrix}
                rowLabels={results['X Axis']}
                colLabels={results['Y Axis']}
                mode={metric.toLowerCase()}
                rowAxisTitle="Spot price"
                colAxisTitle="Volatility"
              />
            ) : <p className="panel-subtext">No heatmap data for this selection.</p>}
          </>
        )}
      </div>
    </section>
  );
}
