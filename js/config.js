export const FIXED_FUNCTION = 'x^3 - 2*x^2 + x + 1';

export const APP_STATE = {
  expression: FIXED_FUNCTION,
  mode: 'function',
  xMin: -10,
  xMax: 10,
  x0: 1,
  sampleCount: 401
};

export const MODE_LABELS = {
  function: 'исходной функции',
  derivative: 'производной',
  integral: 'первообразной'
};

export const PLOT_COLORS = {
  function: '#38bdf8',
  derivative: '#f97316',
  integral: '#22c55e',
  reference: 'rgba(226, 232, 240, 0.42)',
  extrema: '#facc15'
};
