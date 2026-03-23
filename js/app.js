import { autoscalePlot, purgePlot, renderPlot } from './plot-manager.js';
import { runMathPipeline } from './math-engine.js';
import { createDefaultState, readStateFromForm, validateState } from './state.js';
import { getElements, populateExamples, applyStateToForm, renderEmptyValues, renderMessage, renderValues } from './ui.js';
import { debounce } from './utils.js';

export function initApp() {
  const elements = getElements();
  const defaultState = createDefaultState();

  populateExamples(elements.exampleSelect);
  applyStateToForm(elements, defaultState);
  renderEmptyValues(elements);
  renderMessage(elements, 'Введите выражение и настройте параметры. График можно обновлять автоматически или кнопкой.', 'success');

  const debouncedRender = debounce(() => executePipeline(elements), 220);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    executePipeline(elements);
  });

  elements.resetButton.addEventListener('click', () => {
    applyStateToForm(elements, createDefaultState());
    executePipeline(elements);
  });

  elements.applyExampleButton.addEventListener('click', () => {
    elements.functionInput.value = elements.exampleSelect.value;
    maybeAutoRender(elements, debouncedRender);
  });

  elements.autoscaleButton.addEventListener('click', () => {
    autoscalePlot(elements.graph);
  });

  bindAutoRenderEvents(elements, debouncedRender);
  executePipeline(elements);
}

function bindAutoRenderEvents(elements, debouncedRender) {
  const controls = [
    elements.functionInput,
    elements.exampleSelect,
    elements.xMinInput,
    elements.xMaxInput,
    elements.sampleCountInput,
    elements.showFunctionInput,
    elements.showDerivativeInput,
    elements.showIntegralInput,
    elements.referenceXInput,
    elements.autoUpdateInput
  ];

  controls.forEach((control) => {
    const eventName = control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(eventName, () => {
      if (control === elements.exampleSelect) {
        elements.functionInput.value = elements.exampleSelect.value;
      }
      maybeAutoRender(elements, debouncedRender);
    });
  });
}

function maybeAutoRender(elements, debouncedRender) {
  if (elements.autoUpdateInput.checked) {
    debouncedRender();
    return;
  }

  renderMessage(elements, 'Автообновление выключено. Нажмите «Построить график», чтобы пересчитать данные.', 'warning');
}

function executePipeline(elements) {
  try {
    if (!window.Plotly || !window.math) {
      renderMessage(elements, 'Библиотеки Plotly.js и math.js ещё загружаются. Подождите пару секунд.', 'warning');
      return;
    }

    const state = validateState(readStateFromForm(elements));
    const datasets = runMathPipeline(state);
    renderPlot(elements.graph, state, datasets);
    renderValues(elements, datasets.analysis);
    renderMessage(
      elements,
      `График обновлён. Производная вычислена через math.js, первообразная построена численно, найдено экстремумов: ${datasets.extrema.length}.`,
      'success'
    );
  } catch (error) {
    purgePlot(elements.graph);
    renderEmptyValues(elements);
    renderMessage(elements, error.message || 'Не удалось построить график.', 'error');
  }
}
