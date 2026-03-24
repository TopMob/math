window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { APP_STATE } = window.MathVisualizer.config;
  const availableModes = new Set(['function', 'derivative', 'integral', 'combo']);

  function createInitialState() {
    return {
      ...APP_STATE,
      viewport: { ...APP_STATE.viewport }
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

  function updateViewport(state, patch) {
    const nextViewport = {
      ...state.viewport,
      ...patch
    };

    if (
      !Number.isFinite(nextViewport.xMin)
      || !Number.isFinite(nextViewport.xMax)
      || !Number.isFinite(nextViewport.yMin)
      || !Number.isFinite(nextViewport.yMax)
      || nextViewport.xMin >= nextViewport.xMax
      || nextViewport.yMin >= nextViewport.yMax
    ) {
      return state;
    }

    if (
      nextViewport.xMin === state.viewport.xMin
      && nextViewport.xMax === state.viewport.xMax
      && nextViewport.yMin === state.viewport.yMin
      && nextViewport.yMax === state.viewport.yMax
    ) {
      return state;
    }

    return {
      ...state,
      viewport: nextViewport
    };
  }

  function validateState(state) {
    if (!availableModes.has(state.mode)) {
      throw new Error('Не выбран режим отображения.');
    }

    if (
      !Number.isFinite(state.viewport.xMin)
      || !Number.isFinite(state.viewport.xMax)
      || !Number.isFinite(state.viewport.yMin)
      || !Number.isFinite(state.viewport.yMax)
      || state.viewport.xMin >= state.viewport.xMax
      || state.viewport.yMin >= state.viewport.yMax
    ) {
      throw new Error('Некорректный диапазон графика.');
    }

    if (!Number.isInteger(state.sampleCount) || state.sampleCount < 2) {
      throw new Error('Некорректная плотность выборки.');
    }

    return state;
  }

  window.MathVisualizer.state = {
    createInitialState,
    updateMode,
    updateViewport,
    validateState
  };
})();
