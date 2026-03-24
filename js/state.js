window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { APP_STATE } = window.MathVisualizer.config;
  const availableModes = new Set(['function', 'derivative', 'integral', 'combo']);

  function createInitialState() {
    return {
      ...APP_STATE,
      viewport: { ...APP_STATE.viewport },
      axisSettings: { ...APP_STATE.axisSettings }
    };
  }

  function updateMode(state, mode) {
    if (!availableModes.has(mode)) {
      return state;
    }

    return {
      ...state,
      mode
    };
  }

  function updateViewport(state, xMin, xMax) {
    if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || xMin >= xMax) {
      return state;
    }

    return {
      ...state,
      viewport: {
        xMin,
        xMax
      }
    };
  }

  function clampValue(value, min, max, fallback) {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }

  function updateAxisSettings(state, patch) {
    const current = state.axisSettings;
    const next = {
      yScale: clampValue(patch.yScale ?? current.yScale, 0.03, 1, current.yScale),
      yMaxAbs: clampValue(patch.yMaxAbs ?? current.yMaxAbs, 20, 2000000, current.yMaxAbs),
      lockAspect: Boolean(patch.lockAspect ?? current.lockAspect),
      yPerX: clampValue(patch.yPerX ?? current.yPerX, 0.05, 200, current.yPerX)
    };

    if (
      next.yScale === current.yScale
      && next.yMaxAbs === current.yMaxAbs
      && next.lockAspect === current.lockAspect
      && next.yPerX === current.yPerX
    ) {
      return state;
    }

    return {
      ...state,
      axisSettings: next
    };
  }

  function validateState(state) {
    if (!availableModes.has(state.mode)) {
      throw new Error('Не выбран режим отображения.');
    }

    if (!Number.isFinite(state.viewport.xMin) || !Number.isFinite(state.viewport.xMax) || state.viewport.xMin >= state.viewport.xMax) {
      throw new Error('Некорректный диапазон графика.');
    }

    if (!Number.isInteger(state.sampleCount) || state.sampleCount < 2) {
      throw new Error('Некорректная плотность выборки.');
    }

    if (!state.axisSettings || !Number.isFinite(state.axisSettings.yScale) || !Number.isFinite(state.axisSettings.yMaxAbs) || !Number.isFinite(state.axisSettings.yPerX)) {
      throw new Error('Некорректные настройки осей.');
    }

    return state;
  }

  window.MathVisualizer.state = {
    createInitialState,
    updateMode,
    updateViewport,
    updateAxisSettings,
    validateState
  };
})();
