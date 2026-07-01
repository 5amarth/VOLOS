// Color interpolation helpers for heatmaps (price = plum -> electric cyan)
// and profit maps (red for losses -> green for gains).

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const clampT = Math.max(0, Math.min(1, t));
  return rgbToHex(
    a.r + (b.r - a.r) * clampT,
    a.g + (b.g - a.g) * clampT,
    a.b + (b.b - a.b) * clampT
  );
}

// Plum-ish purple -> electric cyan, used for absolute price heatmaps and the vol surface
export const PRICE_SCALE_LOW = '#8B5FBF';
export const PRICE_SCALE_HIGH = '#00F0FF';

// Deep crimson (loss) -> muted stone (near zero) -> emerald (gain)
export const PROFIT_SCALE_LOSS = '#FF3B3B';
export const PROFIT_SCALE_MID = '#3A3A2E';
export const PROFIT_SCALE_GAIN = '#3FA65C';

export function flattenMatrix(matrix) {
  return matrix.flat();
}

export function matrixMinMax(matrix) {
  const flat = flattenMatrix(matrix);
  return { min: Math.min(...flat), max: Math.max(...flat) };
}

// Builds N discrete color "ranges" for ApexCharts heatmap colorScale.ranges
export function buildPriceRanges(min, max, steps = 12) {
  if (min === max) {
    return [{ from: min - 1, to: max + 1, color: PRICE_SCALE_HIGH, name: min.toFixed(2) }];
  }
  const span = max - min;
  const ranges = [];
  for (let i = 0; i < steps; i++) {
    const from = min + (span * i) / steps;
    const to = min + (span * (i + 1)) / steps;
    const t = (i + 0.5) / steps;
    ranges.push({
      from,
      to,
      color: lerpColor(PRICE_SCALE_LOW, PRICE_SCALE_HIGH, t),
      name: `${from.toFixed(2)}–${to.toFixed(2)}`,
    });
  }
  return ranges;
}

// Builds diverging red -> stone -> green ranges, symmetric around zero
export function buildProfitRanges(min, max, steps = 12) {
  const absMax = Math.max(Math.abs(min), Math.abs(max), 1e-6);
  const span = absMax * 2;
  const ranges = [];
  for (let i = 0; i < steps; i++) {
    const from = -absMax + (span * i) / steps;
    const to = -absMax + (span * (i + 1)) / steps;
    const mid = (from + to) / 2;
    const t = mid / absMax; // -1 .. 1
    let color;
    if (t < 0) {
      color = lerpColor(PROFIT_SCALE_MID, PROFIT_SCALE_LOSS, Math.min(1, -t));
    } else {
      color = lerpColor(PROFIT_SCALE_MID, PROFIT_SCALE_GAIN, Math.min(1, t));
    }
    ranges.push({ from, to, color, name: `${from.toFixed(2)}–${to.toFixed(2)}` });
  }
  return ranges;
}

// A smooth colorscale array for Plotly (0..1 stops) matching the price palette
export function plotlyPriceColorscale(stepsCount = 10) {
  const stops = [];
  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    stops.push([t, lerpColor(PRICE_SCALE_LOW, PRICE_SCALE_HIGH, t)]);
  }
  return stops;
}

// Distinct color palette for many line series (Monte Carlo paths), evenly spaced hues
export function distinctHueColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 * i) / count);
    colors.push(`hsl(${hue}, 70%, 62%)`);
  }
  return colors;
}
