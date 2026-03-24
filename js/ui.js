window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { MODE_DETAILS } = window.MathVisualizer.config;
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
      modeTitle: requireElement('modeTitle'),
      modeDescription: requireElement('modeDescription'),
      metricPrimaryLabel: requireElement('metricPrimaryLabel'),
      metricSecondaryLabel: requireElement('metricSecondaryLabel'),
      metricTertiaryLabel: requireElement('metricTertiaryLabel'),
      metricPrimary: requireElement('metricPrimary'),
      metricSlope: requireElement('metricSlope'),
      metricExtrema: requireElement('metricExtrema'),
      sceneRange: requireElement('sceneRange'),
      sceneDensity: requireElement('sceneDensity'),
      sceneFocus: requireElement('sceneFocus'),
      sceneHint: requireElement('sceneHint'),
      chartStatus: requireElement('chartStatus')
    };
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
    const modeDetails = MODE_DETAILS[mode];

    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.modeTitle.textContent = modeDetails.title;
    elements.modeDescription.textContent = modeDetails.description;
    elements.sceneRange.textContent = `Окно: ${formatNumber(state.viewport.xMin)} … ${formatNumber(state.viewport.xMax)}`;
    elements.sceneDensity.textContent = formatPointCount(state.sampleCount);
    elements.sceneFocus.textContent = modeDetails.focus;
    elements.sceneHint.textContent = modeDetails.status;
  }

  function renderModeMetrics(elements, config) {
    elements.metricPrimaryLabel.textContent = config.primaryLabel;
    elements.metricSecondaryLabel.textContent = config.secondaryLabel;
    elements.metricTertiaryLabel.textContent = config.tertiaryLabel;
    elements.metricPrimary.textContent = config.primaryValue;
    elements.metricSlope.textContent = config.secondaryValue;
    elements.metricExtrema.textContent = config.tertiaryValue;
  }

  function buildMetricsForFunction(datasets) {
    return {
      primaryLabel: 'f(0)',
      secondaryLabel: 'Корни в окне',
      tertiaryLabel: 'Экстремумы в окне',
      primaryValue: formatNumber(datasets.stats.function.atZero),
      secondaryValue: String(datasets.roots.function.length),
      tertiaryValue: String(datasets.extrema.length)
    };
  }

  function buildMetricsForDerivative(datasets) {
    return {
      primaryLabel: 'f′(0)',
      secondaryLabel: 'Нули f′ в окне',
      tertiaryLabel: 'Диапазон f′',
      primaryValue: formatNumber(datasets.stats.derivative.atZero),
      secondaryValue: String(datasets.roots.derivative.length),
      tertiaryValue: `${formatNumber(datasets.stats.derivative.min)} … ${formatNumber(datasets.stats.derivative.max)}`
    };
  }

  function buildMetricsForIntegral(datasets) {
    return {
      primaryLabel: 'F(0)',
      secondaryLabel: 'F′(0) = f(0)',
      tertiaryLabel: 'Нули F в окне',
      primaryValue: formatNumber(datasets.stats.integral.atZero),
      secondaryValue: formatNumber(datasets.stats.function.atZero),
      tertiaryValue: String(datasets.roots.integral.length)
    };
  }

  function buildMetricsForCombo(state, datasets) {
    return {
      primaryLabel: 'f(0) · f′(0) · F(0)',
      secondaryLabel: 'Диапазон X',
      tertiaryLabel: 'Экстремумы функции',
      primaryValue: [
        `f=${formatNumber(datasets.stats.function.atZero)}`,
        `f′=${formatNumber(datasets.stats.derivative.atZero)}`,
        `F=${formatNumber(datasets.stats.integral.atZero)}`
      ].join(' · '),
      secondaryValue: `${formatNumber(state.viewport.xMin)} … ${formatNumber(state.viewport.xMax)}`,
      tertiaryValue: String(datasets.extrema.length)
    };
  }

  function renderMetrics(elements, state, datasets) {
    if (state.mode === 'combo') {
      renderModeMetrics(elements, buildMetricsForCombo(state, datasets));
      return;
    }

    if (state.mode === 'function') {
      renderModeMetrics(elements, buildMetricsForFunction(datasets));
      return;
    }

    if (state.mode === 'derivative') {
      renderModeMetrics(elements, buildMetricsForDerivative(datasets));
      return;
    }

    renderModeMetrics(elements, buildMetricsForIntegral(datasets));
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
