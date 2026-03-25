window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { MODE_FORMULAS } = window.MathVisualizer.config;

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
      chartStatus: requireElement('chartStatus')
    };
  }

  function renderActiveMode(elements, mode) {
    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.formulaTitle.textContent = MODE_FORMULAS[mode] || MODE_FORMULAS.function;
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
    renderMetrics,
    setChartStatus
  };
})();
