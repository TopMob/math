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
    const currentStats = datasets.stats[state.mode];
    const derivativeAtZero = datasets.stats.derivative.atZero;

    elements.metricPrimary.textContent = formatNumber(currentStats.atZero);
    elements.metricSlope.textContent = formatNumber(derivativeAtZero);
    elements.metricExtrema.textContent = String(datasets.extrema.length);
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode,
    renderMetrics
  };
})();
