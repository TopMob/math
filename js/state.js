window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { APP_STATE } = window.MathVisualizer.config;
  const availableModes = new Set(['function', 'derivative', 'integral']);

  function createInitialState() {
    return {
      ...APP_STATE,
      viewport: { ...APP_STATE.viewport }
    };
  }

  function updateMode(state, mode) {
    return {
      ...state,
      mode
    };
  }

  function updateViewport(state, xMin, xMax) {
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

    return state;
  }

  window.MathVisualizer.state = {
    createInitialState,
    updateMode,
    updateViewport,
    validateState
  };
})();
