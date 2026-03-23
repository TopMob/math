window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, bindViewportEvents, purgePlot } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, updateViewport, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderMetrics } = window.MathVisualizer.ui;

  function initApp() {
    const elements = getElements();
    let state = createInitialState();
    let viewportBound = false;

    function executePipeline(options = {}) {
      try {
        const validState = validateState(state);
        const datasets = runMathPipeline(validState);
        renderActiveMode(elements, validState.mode);
        renderMetrics(elements, validState, datasets);
        renderPlot(elements.graph, validState, datasets, options).then(() => {
          if (!viewportBound) {
            bindViewportEvents(elements.graph, (xMin, xMax) => {
              state = updateViewport(state, xMin, xMax);
              executePipeline({ animate: false });
            });
            viewportBound = true;
          }
        });
      } catch {
        purgePlot(elements.graph);
      }
    }

    function waitForLibraries(attempt = 0) {
      if (window.Plotly && window.math) {
        executePipeline({ animate: true });
        return;
      }

      if (attempt >= 40) {
        return;
      }

      window.setTimeout(() => waitForLibraries(attempt + 1), 250);
    }

    renderActiveMode(elements, state.mode);
    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state = updateMode(state, button.dataset.mode);
        executePipeline({ animate: true });
      });
    });

    waitForLibraries();
  }

  window.MathVisualizer.initApp = initApp;
})();
