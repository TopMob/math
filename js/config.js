window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    viewport: {
      xMin: -4,
      xMax: 4
    },
    sampleCount: 1001
  },
  MODE_LABELS: {
    function: 'Функция',
    derivative: 'Производная',
    integral: 'Первообразная'
  },
  MODE_DETAILS: {
    function: {
      title: 'Функция',
      description: 'Исходная кривая с акцентом на форму, баланс масштаба и экстремумы.'
    },
    derivative: {
      title: 'Производная',
      description: 'Темп изменения функции. Здесь сразу видно, где исходная кривая ускоряется или замедляется.'
    },
    integral: {
      title: 'Первообразная',
      description: 'Накопление площади под графиком, показанное спокойно и без визуального шума.'
    }
  },
  PLOT_COLORS: {
    function: '#38bdf8',
    derivative: '#fb923c',
    integral: '#4ade80',
    extrema: '#facc15',
    glow: 'rgba(125, 211, 252, 0.22)',
    grid: 'rgba(148, 163, 184, 0.13)',
    axis: 'rgba(148, 163, 184, 0.3)'
  },
  ANIMATION: {
    duration: 1150,
    fps: 60,
    easing: 0.9
  }
};
