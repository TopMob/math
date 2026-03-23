import { EXAMPLES } from './config.js';
import { formatNumber } from './utils.js';

export function getElements() {
  return {
    form: document.getElementById('controls-form'),
    functionInput: document.getElementById('function-input'),
    exampleSelect: document.getElementById('example-select'),
    applyExampleButton: document.getElementById('apply-example-button'),
    xMinInput: document.getElementById('x-min'),
    xMaxInput: document.getElementById('x-max'),
    sampleCountInput: document.getElementById('sample-count'),
    showFunctionInput: document.getElementById('show-function'),
    showDerivativeInput: document.getElementById('show-derivative'),
    showIntegralInput: document.getElementById('show-integral'),
    referenceXInput: document.getElementById('reference-x'),
    autoUpdateInput: document.getElementById('auto-update'),
    resetButton: document.getElementById('reset-button'),
    autoscaleButton: document.getElementById('autoscale-button'),
    graph: document.getElementById('graph'),
    valuesCard: document.getElementById('values-card'),
    messageBox: document.getElementById('message-box')
  };
}

export function populateExamples(selectElement) {
  selectElement.innerHTML = EXAMPLES.map(
    ({ label, value }) => `<option value="${value}">${label}</option>`
  ).join('');
}

export function applyStateToForm(elements, state) {
  elements.functionInput.value = state.expression;
  elements.exampleSelect.value = state.selectedExample;
  elements.xMinInput.value = String(state.xMin);
  elements.xMaxInput.value = String(state.xMax);
  elements.sampleCountInput.value = String(state.sampleCount);
  elements.referenceXInput.value = String(state.x0);
  elements.autoUpdateInput.checked = state.autoUpdate;
  elements.showFunctionInput.checked = state.visibleSeries.function;
  elements.showDerivativeInput.checked = state.visibleSeries.derivative;
  elements.showIntegralInput.checked = state.visibleSeries.integral;
}

export function renderMessage(elements, text, type = '') {
  elements.messageBox.textContent = text;
  elements.messageBox.className = `message-box${type ? ` ${type}` : ''}`;
}

export function renderValues(elements, analysis) {
  const rows = [
    { label: `f(${formatNumber(analysis.x0)})`, value: analysis.functionValue },
    { label: `f'(${formatNumber(analysis.x0)})`, value: analysis.derivativeValue },
    { label: `F(${formatNumber(analysis.x0)})`, value: analysis.integralValue }
  ];

  elements.valuesCard.innerHTML = rows
    .map(({ label, value }) => `<div class="value-row"><span>${label}</span><strong>${formatNumber(value)}</strong></div>`)
    .join('');
}

export function renderEmptyValues(elements) {
  elements.valuesCard.innerHTML = [
    { label: 'f(x0)', value: 'нет данных' },
    { label: "f'(x0)", value: 'нет данных' },
    { label: 'F(x0)', value: 'нет данных' }
  ]
    .map(({ label, value }) => `<div class="value-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}
