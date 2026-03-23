import { DEFAULT_FORM_STATE, SAMPLE_LIMITS } from './config.js';
import { clamp } from './utils.js';

export function createDefaultState() {
  return {
    ...DEFAULT_FORM_STATE,
    visibleSeries: { ...DEFAULT_FORM_STATE.visibleSeries }
  };
}

export function readStateFromForm(elements) {
  return normalizeState({
    expression: elements.functionInput.value.trim(),
    selectedExample: elements.exampleSelect.value,
    xMin: Number(elements.xMinInput.value),
    xMax: Number(elements.xMaxInput.value),
    x0: Number(elements.referenceXInput.value),
    sampleCount: Number(elements.sampleCountInput.value),
    autoUpdate: elements.autoUpdateInput.checked,
    visibleSeries: {
      function: elements.showFunctionInput.checked,
      derivative: elements.showDerivativeInput.checked,
      integral: elements.showIntegralInput.checked
    }
  });
}

export function normalizeState(partialState) {
  const fallback = createDefaultState();
  const sampleCount = Number.isFinite(partialState.sampleCount)
    ? Math.round(partialState.sampleCount)
    : fallback.sampleCount;

  return {
    expression: partialState.expression || fallback.expression,
    selectedExample: partialState.selectedExample || fallback.selectedExample,
    xMin: Number.isFinite(partialState.xMin) ? partialState.xMin : fallback.xMin,
    xMax: Number.isFinite(partialState.xMax) ? partialState.xMax : fallback.xMax,
    x0: Number.isFinite(partialState.x0) ? partialState.x0 : fallback.x0,
    sampleCount: clamp(sampleCount, SAMPLE_LIMITS.min, SAMPLE_LIMITS.max),
    autoUpdate: Boolean(partialState.autoUpdate),
    visibleSeries: {
      function: Boolean(partialState.visibleSeries?.function),
      derivative: Boolean(partialState.visibleSeries?.derivative),
      integral: Boolean(partialState.visibleSeries?.integral)
    }
  };
}

export function validateState(state) {
  if (!state.expression) {
    throw new Error('Введите выражение функции.');
  }

  if (!Number.isFinite(state.xMin) || !Number.isFinite(state.xMax)) {
    throw new Error('Поля x_min и x_max должны быть числовыми.');
  }

  if (state.xMin >= state.xMax) {
    throw new Error('Значение x_min должно быть меньше x_max.');
  }

  if (!Number.isFinite(state.x0)) {
    throw new Error('Точка анализа x0 должна быть числовой.');
  }

  if (!Number.isFinite(state.sampleCount)) {
    throw new Error('Количество точек sampleCount должно быть числом.');
  }

  if (!state.visibleSeries.function && !state.visibleSeries.derivative && !state.visibleSeries.integral) {
    throw new Error('Выберите хотя бы один график для отображения.');
  }

  return state;
}
