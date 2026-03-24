window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, bindViewportEvents, purgePlot } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, updateViewport, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderMetrics, setChartStatus } = window.MathVisualizer.ui;

  function isViewportChanged(currentViewport, nextViewport) {
    return Math.abs(currentViewport.xMin - nextViewport.xMin) > 1e-7 || Math.abs(currentViewport.xMax - nextViewport.xMax) > 1e-7;
  }

  function initApp() {
    const elements = getElements();
    let state = createInitialState();
    let viewportBound = false;
    let viewportTimer = null;

    function executePipeline(statusText = 'График обновлён') {
      try {
        const validState = validateState(state);
        setChartStatus(elements, 'Обновляю сцену…', true);
        const datasets = runMathPipeline(validState);
        renderActiveMode(elements, validState.mode, validState);
        renderMetrics(elements, validState, datasets);
        renderPlot(elements.graph, validState, datasets)
          .then(() => {
            setChartStatus(elements, statusText, false);
            if (!viewportBound) {
              bindViewportEvents(elements.graph, (xMin, xMax) => {
                window.clearTimeout(viewportTimer);
                viewportTimer = window.setTimeout(() => {
                  const nextState = updateViewport(state, xMin, xMax);
                  if (!isViewportChanged(state.viewport, nextState.viewport)) {
                    return;
                  }

                  state = nextState;
                  executePipeline('Окно анализа обновлено');
                }, 120);
              });
              viewportBound = true;
            }
          })
          .catch(() => {
            setChartStatus(elements, 'Не удалось отрисовать график', false);
            purgePlot(elements.graph);
          });
      } catch {
        setChartStatus(elements, 'Ошибка вычислений', false);
        purgePlot(elements.graph);
      }
    }

    function waitForLibraries(attempt = 0) {
      if (window.Plotly && window.math) {
        executePipeline();
        return;
      }

      if (attempt >= 40) {
        setChartStatus(elements, 'Библиотеки не загрузились', false);
        return;
      }

      window.setTimeout(() => waitForLibraries(attempt + 1), 250);
    }

    renderActiveMode(elements, state.mode, state);
    setChartStatus(elements, 'Загружаю график…', true);

    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextState = updateMode(state, button.dataset.mode);
        if (nextState === state) {
          return;
        }

        state = nextState;
        executePipeline(`Режим: ${button.textContent}`);
      });
    });

    waitForLibraries();
  }

  window.MathVisualizer.initApp = initApp;
})();
