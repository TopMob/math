import { runMathPipeline } from './math-engine.js';
import { MODE_LABELS } from './config.js';
import { renderPlot, purgePlot } from './plot-manager.js';
import { createInitialState, updateMode, validateState } from './state.js';
import { getElements, renderActiveMode, renderInitialMessage, renderMessage, renderValues } from './ui.js';

export function initApp() {
  const elements = getElements();
  let state = createInitialState();

  renderInitialMessage(elements);
  renderActiveMode(elements, state.mode);
  bindModeButtons(elements, (nextMode) => {
    state = updateMode(state, nextMode);
    renderActiveMode(elements, state.mode);
    executePipeline(elements, state);
  });
  waitForLibraries(elements, state);
}

function bindModeButtons(elements, onSelectMode) {
  elements.modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      onSelectMode(button.dataset.mode);
    });
  });
}

function waitForLibraries(elements, state, attempt = 0) {
  if (window.Plotly && window.math) {
    executePipeline(elements, state);
    return;
  }

  if (attempt >= 40) {
    renderMessage(elements, 'Не удалось загрузить Plotly.js или math.js. Проверьте доступ к CDN и обновите страницу.', 'error');
    return;
  }

  renderMessage(elements, 'Загрузка Plotly.js и math.js…', 'warning');
  window.setTimeout(() => waitForLibraries(elements, state, attempt + 1), 250);
}

function executePipeline(elements, state) {
  try {
    const validState = validateState(state);
    const datasets = runMathPipeline(validState);
    renderPlot(elements.graph, validState, datasets);
    renderValues(elements, datasets.analysis);
    renderMessage(elements, `Построен график ${MODE_LABELS[validState.mode]}.`, 'success');
  } catch (error) {
    purgePlot(elements.graph);
    renderMessage(elements, error.message || 'Не удалось построить график.', 'error');
  }
}
