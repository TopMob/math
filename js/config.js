window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    viewport: {
      xMin: -4.5,
      xMax: 4.5,
      yMin: -20,
      yMax: 40
    },
    sampleCount: 501
  },
  MODE_LABELS: {
    function: 'Функция',
    derivative: 'Производная',
    integral: 'Первообразная',
    combo: '3 в 1'
  },
  MODE_FORMULAS: {
    function: 'f(x) = x³ − 2x² + x + 1',
    derivative: 'f′(x) = 3x² − 4x + 1',
    integral: 'F(x) = x⁴/4 − 2x³/3 + x²/2 + x',
    combo: 'f(x), f′(x), F(x)'
  },
  PLOT_COLORS: {
    function: '#38bdf8',
    derivative: '#a78bfa',
    integral: '#34d399',
    extremaFunction: '#fbbf24',
    extremaDerivative: '#f472b6',
    extremaIntegral: '#22d3ee',
    comboText: '#dbeafe',
    origin: '#f8fafc',
    grid: 'rgba(96, 165, 250, 0.12)',
    axis: 'rgba(59, 130, 246, 0.34)',
    axisStrong: 'rgba(125, 211, 252, 0.72)',
    legendBg: 'rgba(8, 18, 36, 0.86)'
  }
};
