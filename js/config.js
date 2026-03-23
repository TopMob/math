window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    viewport: {
      xMin: -4.5,
      xMax: 4.5
    },
    sampleCount: 501
  },
  MODE_LABELS: {
    function: 'Функция',
    derivative: 'Производная',
    integral: 'Первообразная',
    combo: '3 в 1'
  },
  MODE_DETAILS: {
    function: {
      title: 'Функция',
      description: 'Исходная кривая в спокойном масштабе с подчёркнутой координатной плоскостью.'
    },
    derivative: {
      title: 'Производная',
      description: 'Темп изменения функции на той же аккуратной сетке без тяжёлой анимации.'
    },
    integral: {
      title: 'Первообразная',
      description: 'Накопление площади относительно нуля с быстрым и стабильным рендером.'
    },
    combo: {
      title: '3 в 1',
      description: 'Три хорошо различимых графика на одной координатной плоскости с чистой легендой.'
    }
  },
  PLOT_COLORS: {
    function: '#38bdf8',
    derivative: '#a78bfa',
    integral: '#34d399',
    comboText: '#dbeafe',
    extrema: '#fbbf24',
    origin: '#f8fafc',
    grid: 'rgba(96, 165, 250, 0.12)',
    axis: 'rgba(59, 130, 246, 0.34)',
    axisStrong: 'rgba(125, 211, 252, 0.72)',
    legendBg: 'rgba(8, 18, 36, 0.86)'
  }
};
