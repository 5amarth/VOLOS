import React, { useMemo, useState } from 'react';
import {
  matrixMinMax, buildPriceRanges, buildProfitRanges,
  priceBucketIndex, profitBucketIndex,
  priceGradientCSS, profitGradientCSS, HEATMAP_STEPS,
} from '../utils/colorScale';
import './Heatmap.css';

// matrix: 2D array, matrix[i][j] -> row i, col j
// rowLabels / colLabels: arrays of numbers to label rows/cols
// mode: 'price' | 'profit'
export default function Heatmap({ matrix, rowLabels, colLabels, mode, rowAxisTitle, colAxisTitle }) {
  const [hoveredBucket, setHoveredBucket] = useState(null);

  const { min, max, ranges } = useMemo(() => {
    const { min, max } = matrixMinMax(matrix);
    const ranges = mode === 'profit' ? buildProfitRanges(min, max) : buildPriceRanges(min, max);
    return { min, max, ranges };
  }, [matrix, mode]);

  const bucketOf = (value) => (
    mode === 'profit' ? profitBucketIndex(value, min, max) : priceBucketIndex(value, min, max)
  );

  const gradientCSS = useMemo(
    () => (mode === 'profit' ? profitGradientCSS() : priceGradientCSS()),
    [mode]
  );

  const handleLegendMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const bucket = Math.max(0, Math.min(HEATMAP_STEPS - 1, Math.floor(fraction * HEATMAP_STEPS)));
    setHoveredBucket(bucket);
  };

  const numCols = colLabels.length;

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-body">
        <div className="heatmap-yaxis-title">{rowAxisTitle}</div>

        <div className="heatmap-scroll">
          <div
            className="heatmap-grid"
            style={{ gridTemplateColumns: `72px repeat(${numCols}, minmax(50px, 1fr))` }}
          >
            {matrix.map((row, i) => (
              <React.Fragment key={i}>
                <div className="heatmap-row-label">{rowLabels[i] !== undefined ? rowLabels[i].toFixed(2) : i}</div>
                {row.map((value, j) => {
                  const bucket = bucketOf(value);
                  const isHighlighted = hoveredBucket !== null && bucket === hoveredBucket;
                  const isDimmed = hoveredBucket !== null && bucket !== hoveredBucket;
                  return (
                    <div
                      key={j}
                      className={[
                        'heatmap-cell',
                        isHighlighted ? 'heatmap-cell--highlighted' : '',
                        isDimmed ? 'heatmap-cell--dimmed' : '',
                      ].join(' ').trim()}
                      style={{ background: ranges[bucket]?.color }}
                      title={value.toFixed(6)}
                    >
                      {value.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            <div className="heatmap-corner" />
            {colLabels.map((c, j) => (
              <div className="heatmap-col-label" key={j}>{c.toFixed(3)}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-xaxis-title">{colAxisTitle}</div>

      <div className="heatmap-legend">
        <div
          className="heatmap-legend-bar"
          style={{ background: gradientCSS }}
          onMouseMove={handleLegendMove}
          onMouseLeave={() => setHoveredBucket(null)}
        />
        <div className="heatmap-legend-labels">
          <span className="heatmap-legend-label">
            {mode === 'profit' ? `${min.toFixed(2)} loss` : min.toFixed(2)}
          </span>
          {mode === 'profit' && <span className="heatmap-legend-label heatmap-legend-label--mid">0</span>}
          <span className="heatmap-legend-label">
            {mode === 'profit' ? `${max.toFixed(2)} gain` : max.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
