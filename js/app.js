window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, bindViewportEvents } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, updateViewport, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderMetrics, setChartStatus } = window.MathVisualizer.ui;

  function isViewportChanged(currentViewport, nextViewport) {
    return Math.abs(currentViewport.xMin - nextViewport.xMin) > 1e-7
      || Math.abs(currentViewport.xMax - nextViewport.xMax) > 1e-7
      || Math.abs(currentViewport.yMin - nextViewport.yMin) > 1e-7
      || Math.abs(currentViewport.yMax - nextViewport.yMax) > 1e-7;
  }

  function initApp() {
    const elements = getElements();
    let state = createInitialState();
    let viewportBound = false;
    let viewportTimer = null;

    function executePipeline(statusText = 'График обновлён') {
      const validState = validateState(state);
      state = validState;
      setChartStatus(elements, 'Обновляю сцену…', true);
      const datasets = runMathPipeline(validState);
      renderActiveMode(elements, validState.mode);
      renderMetrics(elements, validState, datasets);

      renderPlot(elements.graph, validState, datasets)
        .then(() => {
          setChartStatus(elements, statusText, false);
          if (!viewportBound) {
            bindViewportEvents(elements.graph, (nextViewport) => {
              window.clearTimeout(viewportTimer);
              viewportTimer = window.setTimeout(() => {
                const nextState = updateViewport(state, nextViewport);
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
          setChartStatus(elements, 'Ошибка отрисовки', false);
        });
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

    renderActiveMode(elements, state.mode);
    setChartStatus(elements, 'Загружаю график…', true);

    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextState = updateMode(state, button.dataset.mode);
        if (nextState === state) {
          return;
        }

        state = nextState;
        executePipeline('Режим обновлён');
      });
    });

    waitForLibraries();
  }

  window.MathVisualizer.initApp = initApp;
})();
