window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { MODE_LABELS } = window.MathVisualizer.config;
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, purgePlot } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderInitialMessage, renderMessage } = window.MathVisualizer.ui;

  function initApp() {
    const elements = getElements();
    let state = createInitialState();

    renderInitialMessage(elements);
    renderActiveMode(elements, state.mode);
    bindModeButtons(elements, (nextMode) => {
      state = updateMode(state, nextMode);
      renderActiveMode(elements, state.mode);
      executePipeline(elements, state);
    });
    waitForLibraries(elements, state);
  }

  function bindModeButtons(elements, onSelectMode) {
    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        onSelectMode(button.dataset.mode);
      });
    });
  }

  function waitForLibraries(elements, state, attempt = 0) {
    if (window.Plotly && window.math) {
      executePipeline(elements, state);
      return;
    }

    if (attempt >= 40) {
      renderMessage(elements, 'Не удалось загрузить Plotly.js или math.js. Проверьте доступ к CDN и обновите страницу.', 'error');
      return;
    }

    renderMessage(elements, 'Загрузка Plotly.js и math.js…', 'warning');
    window.setTimeout(() => waitForLibraries(elements, state, attempt + 1), 250);
  }

  function executePipeline(elements, state) {
    try {
      const validState = validateState(state);
      const datasets = runMathPipeline(validState);
      renderPlot(elements.graph, validState, datasets);
      renderMessage(elements, `Построен график ${MODE_LABELS[validState.mode]}.`, 'success');
    } catch (error) {
      purgePlot(elements.graph);
      renderMessage(elements, error.message || 'Не удалось построить график.', 'error');
    }
  }

  window.MathVisualizer.initApp = initApp;
})();
