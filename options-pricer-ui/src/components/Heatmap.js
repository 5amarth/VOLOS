import React, { useMemo, useState } from 'react';
import {
  matrixMinMax, buildPriceRanges, buildProfitRanges,
  priceBucketIndex, profitBucketIndex, profitColorAt,
} from '../utils/colorScale';
import './Heatmap.css';

// The color scales use HSL. Pick the foreground by relative luminance so
// both the deepest purples and the brightest cyans keep legible cell values.
function foreground(color) {
  const [hue, saturation, lightness] = color.match(/[\d.]+/g).map(Number);
  const light = lightness / 100;
  const amplitude = (saturation / 100) * Math.min(light, 1 - light);
  const [r, g, b] = [0, 8, 4].map((offset) => {
    const k = (offset + hue / 30) % 12;
    const channel = light - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#000' : '#fff';
}

export default function Heatmap({ matrix, rowLabels, colLabels, mode, rowAxisTitle, colAxisTitle }) {
  const [hoveredBucket, setHoveredBucket] = useState(null);
  const isProfit = mode === 'profit';

  const { min, max, ranges } = useMemo(() => {
    const { min, max } = matrixMinMax(matrix);
    const scale = isProfit ? buildProfitRanges(min, max) : buildPriceRanges(min, max);
    const ranges = (isProfit && min === 0 && max === 0 ? [{ color: profitColorAt(0) }] : scale)
      .map(({ color, from, to }) => ({ color, from, to, textColor: foreground(color) }));
    return { min, max, ranges };
  }, [matrix, isProfit]);

  const bucketOf = (value) => {
    if (ranges.length === 1) return 0;
    return isProfit ? profitBucketIndex(value, min, max) : priceBucketIndex(value, min, max);
  };

  const low = isProfit ? ranges[0].from : min;
  const high = isProfit ? ranges[ranges.length - 1].to : max;

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-xaxis-title">{colAxisTitle}</div>
      <div className="heatmap-scroll" role="region" aria-label={`${isProfit ? 'Profit' : 'Price'} by spot price and volatility`} tabIndex={0}>
        <table className="heatmap-grid">
          <thead>
            <tr>
              <th className="heatmap-corner" scope="col">{rowAxisTitle}</th>
              {colLabels.map((value, j) => <th scope="col" key={j}>{value.toFixed(3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th scope="row" className="heatmap-row-label">{rowLabels[i].toFixed(2)}</th>
                {row.map((value, j) => {
                  const bucket = bucketOf(value);
                  const { color, textColor } = ranges[bucket];
                  return (
                    <td
                      key={j}
                      className={hoveredBucket !== null && bucket !== hoveredBucket ? 'heatmap-cell--dimmed' : undefined}
                      style={{ background: color, color: textColor }}
                      title={`${rowAxisTitle} ${rowLabels[i].toFixed(2)}, ${colAxisTitle.toLowerCase()} ${colLabels[j].toFixed(4)}: ${value.toFixed(6)}`}
                    >
                      {value.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="heatmap-legend">
        <div className="heatmap-legend-bar" onMouseLeave={() => setHoveredBucket(null)} aria-hidden="true">
          {ranges.map(({ color }, index) => (
            <span key={index} style={{ background: color }} onMouseEnter={() => setHoveredBucket(index)} />
          ))}
        </div>
        {ranges.length === 1 ? (
          <div className="heatmap-legend-labels"><span>{min.toFixed(2)} throughout</span></div>
        ) : (
          <div className="heatmap-legend-labels">
            <span>{low.toFixed(2)}{isProfit && ' loss'}</span>
            {isProfit && <span className="heatmap-legend-label--mid">0</span>}
            <span>{isProfit && '+'}{high.toFixed(2)}{isProfit && ' gain'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
