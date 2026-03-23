window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.config = {
  FIXED_FUNCTION: 'x^3 - 2*x^2 + x + 1',
  APP_STATE: {
    expression: 'x^3 - 2*x^2 + x + 1',
    mode: 'function',
    viewport: {
      xMin: -5.5,
      xMax: 5.5
    },
    sampleCount: 801
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
      description: 'Темп изменения функции на той же аккуратной сетке с шагом 1.'
    },
    integral: {
      title: 'Первообразная',
      description: 'Накопление площади относительно нуля без перегруженной анимации.'
    },
    combo: {
      title: '3 в 1',
      description: 'Функция, производная и первообразная на одной координатной плоскости с легендой.'
    }
  },
  PLOT_COLORS: {
    function: '#58d6ff',
    derivative: '#38bdf8',
    integral: '#34d399',
    comboText: '#d1fae5',
    extrema: '#9ef01a',
    origin: '#a7f3d0',
    grid: 'rgba(120, 255, 230, 0.12)',
    axis: 'rgba(70, 240, 190, 0.42)',
    axisStrong: 'rgba(95, 240, 255, 0.72)',
    legendBg: 'rgba(2, 17, 22, 0.85)'
  },
  ANIMATION: {
    duration: 420,
    fps: 24
  }
};
