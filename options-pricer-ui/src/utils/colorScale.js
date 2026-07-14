// Color ramp helpers for heatmaps (price = purple -> electric cyan, brightening
// with value) and profit maps (neutral gray at zero, brightening to green for
// gains / red for losses as magnitude grows). HSL interpolation is used instead
// of raw RGB lerps so the in-between tones stay clean instead of turning muddy.

function hsl(h, s, l) {
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}

// Shared bucket count used for both the discrete color ranges and the
// legend-hover highlighting, so "which bucket is the mouse over" and "which
// bucket is this cell in" are always computed the exact same way.
export const HEATMAP_STEPS = 10;

// ---- Price scale: purple (low) -> electric cyan (high) ------------------
// Lightness is capped at 56% so a light overlaid label stays readable across
// the entire range, from the darkest purple to the brightest cyan.
const PRICE_HUE_LOW = 265;
const PRICE_HUE_HIGH = 189;
const PRICE_SAT_LOW = 45;
const PRICE_SAT_HIGH = 78;
const PRICE_LIGHT_LOW = 32;
const PRICE_LIGHT_HIGH = 56;

export function priceColorAt(t) {
  const ct = clamp01(t);
  const hue = PRICE_HUE_LOW + (PRICE_HUE_HIGH - PRICE_HUE_LOW) * ct;
  const sat = PRICE_SAT_LOW + (PRICE_SAT_HIGH - PRICE_SAT_LOW) * ct;
  const light = PRICE_LIGHT_LOW + (PRICE_LIGHT_HIGH - PRICE_LIGHT_LOW) * ct;
  return hsl(hue, sat, light);
}

// ---- Profit scale: neutral gray at zero -> green (gain) / red (loss) ----
// Hue is fixed per side (no crossing through muddy intermediate hues); only
// saturation and lightness ramp up with magnitude, so the sign is always
// obvious at a glance and the "how much" reads as brightness.
const PROFIT_NEUTRAL_HUE = 45;
const PROFIT_NEUTRAL_SAT = 6;
const PROFIT_NEUTRAL_LIGHT = 38;
const PROFIT_GREEN_HUE = 142;
const PROFIT_RED_HUE = 355;
const PROFIT_SAT_LOW = 16;
const PROFIT_SAT_HIGH = 70;
const PROFIT_LIGHT_LOW = 30;
const PROFIT_LIGHT_HIGH = 50;
const PROFIT_NEUTRAL_DEADZONE = 0.035; // |t| below this reads as "flat"

export function profitColorAt(t) {
  const ct = Math.max(-1, Math.min(1, t));
  const at = Math.abs(ct);
  if (at < PROFIT_NEUTRAL_DEADZONE) {
    return hsl(PROFIT_NEUTRAL_HUE, PROFIT_NEUTRAL_SAT, PROFIT_NEUTRAL_LIGHT);
  }
  const sat = PROFIT_SAT_LOW + (PROFIT_SAT_HIGH - PROFIT_SAT_LOW) * at;
  const light = PROFIT_LIGHT_LOW + (PROFIT_LIGHT_HIGH - PROFIT_LIGHT_LOW) * at;
  const hue = ct >= 0 ? PROFIT_GREEN_HUE : PROFIT_RED_HUE;
  return hsl(hue, sat, light);
}

export function flattenMatrix(matrix) {
  return matrix.flat();
}

export function matrixMinMax(matrix) {
  const flat = flattenMatrix(matrix);
  return { min: Math.min(...flat), max: Math.max(...flat) };
}

// Discrete color "ranges" — used to color each cell by bucket index
export function buildPriceRanges(min, max, steps = HEATMAP_STEPS) {
  if (min === max) {
    return [{ from: min - 1, to: max + 1, color: priceColorAt(1), name: min.toFixed(2) }];
  }
  const span = max - min;
  const ranges = [];
  for (let i = 0; i < steps; i++) {
    const from = min + (span * i) / steps;
    const to = min + (span * (i + 1)) / steps;
    const t = (i + 0.5) / steps;
    ranges.push({ from, to, color: priceColorAt(t), name: `${from.toFixed(2)}–${to.toFixed(2)}` });
  }
  return ranges;
}

// Discrete diverging red -> gray -> green ranges, symmetric around zero
export function buildProfitRanges(min, max, steps = HEATMAP_STEPS) {
  const absMax = Math.max(Math.abs(min), Math.abs(max), 1e-6);
  const span = absMax * 2;
  const ranges = [];
  for (let i = 0; i < steps; i++) {
    const from = -absMax + (span * i) / steps;
    const to = -absMax + (span * (i + 1)) / steps;
    const mid = (from + to) / 2;
    const t = mid / absMax; // -1 .. 1
    ranges.push({ from, to, color: profitColorAt(t), name: `${from.toFixed(2)}–${to.toFixed(2)}` });
  }
  return ranges;
}

// Which bucket (0..steps-1) a given price-heatmap value falls into. Uses the
// exact same equal-width partition as buildPriceRanges, so ranges[index].color
// always matches the color this function implies.
export function priceBucketIndex(value, min, max, steps = HEATMAP_STEPS) {
  if (min === max) return steps - 1;
  const t = (value - min) / (max - min);
  return Math.max(0, Math.min(steps - 1, Math.floor(t * steps)));
}

// Which bucket (0..steps-1) a given profit-heatmap value falls into. Mirrors
// the symmetric partition used by buildProfitRanges.
export function profitBucketIndex(value, min, max, steps = HEATMAP_STEPS) {
  const absMax = Math.max(Math.abs(min), Math.abs(max), 1e-6);
  const t = value / absMax; // -1 .. 1
  const tNorm = (t + 1) / 2; // 0 .. 1
  return Math.max(0, Math.min(steps - 1, Math.floor(tNorm * steps)));
}

// CSS linear-gradient strings for the compact custom legend bar
export function priceGradientCSS(stopsCount = 16) {
  const stops = [];
  for (let i = 0; i <= stopsCount; i++) {
    const t = i / stopsCount;
    stops.push(`${priceColorAt(t)} ${(t * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function profitGradientCSS(stopsCount = 16) {
  const stops = [];
  for (let i = 0; i <= stopsCount; i++) {
    const t = -1 + (2 * i) / stopsCount; // -1 .. 1
    const pos = ((t + 1) / 2) * 100;
    stops.push(`${profitColorAt(t)} ${pos.toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

// A smooth colorscale array for Plotly (0..1 stops), same palette as the price heatmap
export function plotlyPriceColorscale(stepsCount = 12) {
  const stops = [];
  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    stops.push([t, priceColorAt(t)]);
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
