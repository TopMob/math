window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { MODE_DETAILS } = window.MathVisualizer.config;
  const { formatNumber } = window.MathVisualizer.utils;

  function getElements() {
    return {
      graph: document.getElementById('graph'),
      modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
      modeTitle: document.getElementById('modeTitle'),
      modeDescription: document.getElementById('modeDescription'),
      metricPrimaryLabel: document.getElementById('metricPrimaryLabel'),
      metricSecondaryLabel: document.getElementById('metricSecondaryLabel'),
      metricTertiaryLabel: document.getElementById('metricTertiaryLabel'),
      metricPrimary: document.getElementById('metricPrimary'),
      metricSlope: document.getElementById('metricSlope'),
      metricExtrema: document.getElementById('metricExtrema')
    };
  }

  function renderActiveMode(elements, mode) {
    const modeDetails = MODE_DETAILS[mode];

    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.modeTitle.textContent = modeDetails.title;
    elements.modeDescription.textContent = modeDetails.description;
  }

  function renderMetrics(elements, state, datasets) {
    if (state.mode === 'combo') {
      elements.metricPrimaryLabel.textContent = 'f(0) · f′(0) · F(0)';
      elements.metricSecondaryLabel.textContent = 'Диапазон X';
      elements.metricTertiaryLabel.textContent = 'Экстремумы функции';
      elements.metricPrimary.textContent = [
        `f=${formatNumber(datasets.stats.function.atZero)}`,
        `f′=${formatNumber(datasets.stats.derivative.atZero)}`,
        `F=${formatNumber(datasets.stats.integral.atZero)}`
      ].join(' · ');
      elements.metricSlope.textContent = `${formatNumber(state.viewport.xMin)} … ${formatNumber(state.viewport.xMax)}`;
      elements.metricExtrema.textContent = String(datasets.extrema.length);
      return;
    }

    elements.metricPrimaryLabel.textContent = 'Значение при x = 0';
    elements.metricSecondaryLabel.textContent = 'Наклон в нуле';
    elements.metricTertiaryLabel.textContent = 'Экстремумы в окне';
    elements.metricPrimary.textContent = formatNumber(datasets.stats[state.mode].atZero);
    elements.metricSlope.textContent = formatNumber(datasets.stats.derivative.atZero);
    elements.metricExtrema.textContent = String(datasets.extrema.length);
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode,
    renderMetrics
  };
})();
