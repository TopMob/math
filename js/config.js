window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    viewport: {
      xMin: -10,
      xMax: 10
    },
    sampleCount: 801
  },
  MODE_LABELS: {
    function: 'Функция',
    derivative: 'Производная',
    integral: 'Первообразная'
  },
  PLOT_COLORS: {
    function: '#38bdf8',
    derivative: '#f97316',
    integral: '#22c55e',
    extrema: '#facc15'
  }
};
