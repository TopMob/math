window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { runMathPipeline } = window.MathVisualizer.mathEngine;
  const { renderPlot, bindViewportEvents, purgePlot } = window.MathVisualizer.plotManager;
  const { createInitialState, updateMode, updateViewport, updateAxisSettings, validateState } = window.MathVisualizer.state;
  const { getElements, renderActiveMode, renderMetrics, setChartStatus } = window.MathVisualizer.ui;

  function isViewportChanged(currentViewport, nextViewport) {
    return Math.abs(currentViewport.xMin - nextViewport.xMin) > 1e-7 || Math.abs(currentViewport.xMax - nextViewport.xMax) > 1e-7;
  }

  function initApp() {
    const elements = getElements();
    let state = createInitialState();
    let viewportBound = false;
    let viewportTimer = null;
    let axisTimer = null;

    function executePipeline(statusText = 'График обновлён') {
      try {
        const validState = validateState(state);
        setChartStatus(elements, 'Обновляю сцену…', true);
        const datasets = runMathPipeline(validState);
        renderActiveMode(elements, validState.mode, {
          ...validState,
          sampleCount: datasets.sampleCount
        });
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

    function commitAxisPatch(patch, statusText) {
      const nextState = updateAxisSettings(state, patch);
      if (nextState === state) {
        return;
      }

      state = nextState;
      executePipeline(statusText);
    }

    function bindAxisControls() {
      elements.yScaleSlider.addEventListener('input', () => {
        const yScale = Number(elements.yScaleSlider.value);
        elements.yScaleValue.textContent = `${Math.round(yScale * 100)}%`;
        window.clearTimeout(axisTimer);
        axisTimer = window.setTimeout(() => {
          commitAxisPatch({ yScale }, 'Масштаб Y обновлён');
        }, 110);
      });

      elements.yScaleSlider.addEventListener('change', () => {
        commitAxisPatch({ yScale: Number(elements.yScaleSlider.value) }, 'Масштаб Y обновлён');
      });

      elements.yMaxInput.addEventListener('change', () => {
        commitAxisPatch({ yMaxAbs: Number(elements.yMaxInput.value) }, 'Ограничение Y обновлено');
      });

      elements.aspectLockToggle.addEventListener('change', () => {
        commitAxisPatch({ lockAspect: elements.aspectLockToggle.checked }, 'Соотношение X/Y обновлено');
      });

      elements.yPerXInput.addEventListener('change', () => {
        commitAxisPatch({ yPerX: Number(elements.yPerXInput.value) }, 'Коэффициент Y/X обновлён');
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
    setChartStatus(elements, 'Загружаю график…', true);
    bindAxisControls();

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
