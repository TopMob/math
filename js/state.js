window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { APP_STATE } = window.MathVisualizer.config;
  const availableModes = new Set(['function', 'derivative', 'integral']);

  window.MathVisualizer.state = {
    createInitialState() {
      return { ...APP_STATE };
    },

    updateMode(state, mode) {
      return {
        ...state,
        mode
      };
    },

    validateState(state) {
      if (!availableModes.has(state.mode)) {
        throw new Error('Не выбран режим отображения.');
      }

      return state;
    }
  };
})();
