function round(num, decimals) {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}

// Given a live input value (e.g. the current spot price or vol typed into the
// parameters panel), returns a realistic +/- pct window around it, instead of
// a fixed wide range that produces meaningless/extreme corner cells in heatmaps.
export function computeProportionalBounds(rawValue, pct = 0.15, fallbackMin = 1, fallbackMax = 100, decimals = 2) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    return { min: fallbackMin, max: fallbackMax };
  }
  return {
    min: round(value * (1 - pct), decimals),
    max: round(value * (1 + pct), decimals),
  };
}

export function computeStep(min, max, divisions = 150, minStep = 0.0001) {
  return Math.max(minStep, (max - min) / divisions);
}
