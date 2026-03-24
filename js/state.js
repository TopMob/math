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

    return state;
  }

  window.MathVisualizer.state = {
    createInitialState,
    updateMode,
    updateViewport,
    validateState
  };
})();
