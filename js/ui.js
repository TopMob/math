window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { MODE_FORMULAS } = window.MathVisualizer.config;
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
      formulaTitle: requireElement('formulaTitle'),
      chartStatus: requireElement('chartStatus'),
      extremaOutput: requireElement('extremaOutput')
    };
  }

  function renderActiveMode(elements, mode) {
    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.formulaTitle.textContent = MODE_FORMULAS[mode] || MODE_FORMULAS.function;
  }

  function toExtremaText(points) {
    if (!points || points.length === 0) {
      return 'Экстремумов в текущем диапазоне не найдено.';
    }

    return points
      .map((point, index) => `${index + 1}) (${formatNumber(point.x)}; ${formatNumber(point.y)})`)
      .join('\n');
  }

  function renderMetrics(elements, state, datasets) {
    if (state.mode === 'combo') {
      const functionText = toExtremaText(datasets.extremaByMode.function);
      const derivativeText = toExtremaText(datasets.extremaByMode.derivative);
      const integralText = toExtremaText(datasets.extremaByMode.integral);
      elements.extremaOutput.textContent = `f(x):\n${functionText}\n\nf′(x):\n${derivativeText}\n\nF(x):\n${integralText}`;
      return;
    }

    elements.extremaOutput.textContent = toExtremaText(datasets.extremaByMode[state.mode]);
  }

  function setChartStatus(elements, text, isBusy = false) {
    elements.chartStatus.textContent = text;
    elements.chartStatus.classList.toggle('is-busy', isBusy);
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode,
    renderMetrics,
    setChartStatus
  };
})();
