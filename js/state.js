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

  function normalizeViewport(viewport) {
    const safeXMin = Number.isFinite(viewport.xMin) ? viewport.xMin : APP_STATE.viewport.xMin;
    const safeXMax = Number.isFinite(viewport.xMax) ? viewport.xMax : APP_STATE.viewport.xMax;
    const safeYMin = Number.isFinite(viewport.yMin) ? viewport.yMin : APP_STATE.viewport.yMin;
    const safeYMax = Number.isFinite(viewport.yMax) ? viewport.yMax : APP_STATE.viewport.yMax;

    const xMin = Math.min(safeXMin, safeXMax - 1e-6);
    const xMax = Math.max(safeXMax, safeXMin + 1e-6);
    const yMin = Math.min(safeYMin, safeYMax - 1e-6);
    const yMax = Math.max(safeYMax, safeYMin + 1e-6);

    return { xMin, xMax, yMin, yMax };
  }

  function updateViewport(state, patch) {
    const nextViewport = normalizeViewport({
      ...state.viewport,
      ...patch
    });

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
    const mode = availableModes.has(state.mode) ? state.mode : APP_STATE.mode;
    const sampleCount = Number.isInteger(state.sampleCount) && state.sampleCount > 1 ? state.sampleCount : APP_STATE.sampleCount;

    return {
      ...state,
      mode,
      sampleCount,
      viewport: normalizeViewport(state.viewport)
    };
  }

  window.MathVisualizer.state = {
    createInitialState,
    updateMode,
    updateViewport,
    validateState
  };
})();
