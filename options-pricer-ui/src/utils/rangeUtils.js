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
  const min = value * (1 - pct);
  const max = value * (1 + pct);
  const roundedMin = round(min, decimals);
  const roundedMax = round(max, decimals);
  return roundedMin > 0 && roundedMax > roundedMin
    ? { min: roundedMin, max: roundedMax }
    : { min, max };
}

export function computeStep(min, max, divisions = 150, minStep = 0.0001) {
  const span = max - min;
  return span / Math.max(1, Math.min(divisions, Math.floor(span / minStep)));
}
