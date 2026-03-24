window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { formatNumber } = window.MathVisualizer.utils;

  function requireElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Не найден элемент интерфейса: ${id}`);
    }

    return element;
  }

  function getElements() {
    const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
    if (modeButtons.length === 0) {
      throw new Error('Не найдены кнопки режимов отображения.');
    }

    return {
      graph: requireElement('graph'),
      modeButtons,
      sceneRange: requireElement('sceneRange'),
      sceneDensity: requireElement('sceneDensity'),
      chartStatus: requireElement('chartStatus'),
      xMinInput: requireElement('xMinInput'),
      xMaxInput: requireElement('xMaxInput'),
      yMinInput: requireElement('yMinInput'),
      yMaxInput: requireElement('yMaxInput'),
      applyViewportButton: requireElement('applyViewportButton'),
      fitYButton: requireElement('fitYButton')
    };
  }

  function syncViewportControls(elements, viewport) {
    elements.xMinInput.value = String(viewport.xMin);
    elements.xMaxInput.value = String(viewport.xMax);
    elements.yMinInput.value = String(viewport.yMin);
    elements.yMaxInput.value = String(viewport.yMax);
  }

  function formatPointCount(sampleCount) {
    const remainder10 = sampleCount % 10;
    const remainder100 = sampleCount % 100;

    if (remainder10 === 1 && remainder100 !== 11) {
      return `${sampleCount} точка`;
    }

    if (remainder10 >= 2 && remainder10 <= 4 && !(remainder100 >= 12 && remainder100 <= 14)) {
      return `${sampleCount} точки`;
    }

    return `${sampleCount} точек`;
  }

  function renderActiveMode(elements, mode, state) {
    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.sceneRange.textContent = `Окно: ${formatNumber(state.viewport.xMin)} … ${formatNumber(state.viewport.xMax)} | Y: ${formatNumber(state.viewport.yMin)} … ${formatNumber(state.viewport.yMax)}`;
    elements.sceneDensity.textContent = formatPointCount(state.sampleCount);
  }

  function renderMetrics() {
  }

  function setChartStatus(elements, text, isBusy = false) {
    elements.chartStatus.textContent = text;
    elements.chartStatus.classList.toggle('is-busy', isBusy);
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode,
    syncViewportControls,
    renderMetrics,
    setChartStatus
  };
})();
