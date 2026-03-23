window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    xMin: -10,
    xMax: 10,
    x0: 1,
    sampleCount: 401
  },
  MODE_LABELS: {
    function: 'исходной функции',
    derivative: 'производной',
    integral: 'первообразной'
  },
  PLOT_COLORS: {
    function: '#38bdf8',
    derivative: '#f97316',
    integral: '#22c55e',
    reference: 'rgba(226, 232, 240, 0.42)',
    extrema: '#facc15'
  }
};
