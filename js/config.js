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
    sampleCount: 501,
    axisSettings: {
      yScale: 0.24,
      yMaxAbs: 220,
      lockAspect: false,
      yPerX: 2.5
    }
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
      description: 'Исходная кривая с плавной подсветкой, экстремумами и чистым фокусом на самой функции.',
      focus: 'Акцент на функции',
      status: 'Показаны изгибы и экстремумы исходной кривой.'
    },
    derivative: {
      title: 'Производная',
      description: 'Темп изменения функции на той же сцене с быстрым откликом при панорамировании.',
      focus: 'Акцент на скорости изменения',
      status: 'Можно быстро увидеть, где функция растёт и убывает.'
    },
    integral: {
      title: 'Первообразная',
      description: 'Накопление площади относительно нуля с более мягкой анимацией и читаемой шкалой.',
      focus: 'Акцент на накоплении площади',
      status: 'Хорошо виден вклад положительных и отрицательных участков.'
    },
    combo: {
      title: '3 в 1',
      description: 'Три различимых графика на одной плоскости с живой легендой и общей сценой анализа.',
      focus: 'Сравнение всех кривых',
      status: 'Легко сравнивать форму, темп изменения и накопление одновременно.'
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
