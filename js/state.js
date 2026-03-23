import { APP_STATE } from './config.js';

const AVAILABLE_MODES = new Set(['function', 'derivative', 'integral']);

export function createInitialState() {
  return { ...APP_STATE };
}

export function updateMode(state, mode) {
  return {
    ...state,
    mode
  };
}

export function validateState(state) {
  if (!AVAILABLE_MODES.has(state.mode)) {
    throw new Error('Не выбран режим отображения.');
  }

  return state;
}
