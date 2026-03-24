window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, bindViewportEvents, recommendYRange, purgePlot } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, updateViewport, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderMetrics, setChartStatus, syncViewportControls } = window.MathVisualizer.ui;

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
    let lastDatasets = null;

    function executePipeline(statusText = 'График обновлён') {
      try {
        const validState = validateState(state);
        setChartStatus(elements, 'Обновляю сцену…', true);
        const datasets = runMathPipeline(validState);
        lastDatasets = datasets;
        renderActiveMode(elements, validState.mode, {
          ...validState,
          sampleCount: datasets.sampleCount
        });
        syncViewportControls(elements, validState.viewport);
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
            setChartStatus(elements, 'Не удалось отрисовать график', false);
            purgePlot(elements.graph);
          });
      } catch {
        setChartStatus(elements, 'Ошибка вычислений', false);
        purgePlot(elements.graph);
      }
    }

    function bindViewportControls() {
      elements.applyViewportButton.addEventListener('click', () => {
        const nextState = updateViewport(state, {
          xMin: Number(elements.xMinInput.value),
          xMax: Number(elements.xMaxInput.value),
          yMin: Number(elements.yMinInput.value),
          yMax: Number(elements.yMaxInput.value)
        });

        if (nextState === state) {
          return;
        }

        state = nextState;
        executePipeline('Ручной диапазон применён');
      });

      elements.fitYButton.addEventListener('click', () => {
        if (!lastDatasets) {
          return;
        }

        const [yMin, yMax] = recommendYRange(state, lastDatasets);
        const nextState = updateViewport(state, { yMin, yMax });

        if (nextState === state) {
          return;
        }

        state = nextState;
        executePipeline('Диапазон Y подобран автоматически');
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

    renderActiveMode(elements, state.mode, state);
    syncViewportControls(elements, state.viewport);
    setChartStatus(elements, 'Загружаю график…', true);
    bindViewportControls();

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
