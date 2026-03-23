const DEFAULT_STATE = {
  expression: 'x^3 - 2*x^2 + x + 1',
  mode: 'function',
  xMin: -10,
  xMax: 10,
  sampleCount: 401,
  example: 'sin(x) + x^2 / 4'
};

const elements = {
  form: document.getElementById('controls-form'),
  functionInput: document.getElementById('function-input'),
  xMinInput: document.getElementById('x-min'),
  xMaxInput: document.getElementById('x-max'),
  resetButton: document.getElementById('reset-button'),
  exampleButton: document.getElementById('example-button'),
  graph: document.getElementById('graph'),
  messageBox: document.getElementById('message-box'),
  valuesCard: document.getElementById('values-card')
};

function init() {
  bindEvents();
  resetForm();
  renderPlot();
}

function bindEvents() {
  elements.form.addEventListener('submit', handleSubmit);
  elements.resetButton.addEventListener('click', () => {
    resetForm();
    renderPlot();
  });
  elements.exampleButton.addEventListener('click', () => {
    elements.functionInput.value = DEFAULT_STATE.example;
    setMessage('Подставлен пример: sin(x) + x^2 / 4.', 'success');
    renderPlot();
  });

  [elements.functionInput, elements.xMinInput, elements.xMaxInput].forEach((input) => {
    input.addEventListener('input', debounce(renderPlot, 250));
  });

  elements.form.querySelectorAll('input[name="display-mode"]').forEach((radio) => {
    radio.addEventListener('change', renderPlot);
  });
}

function handleSubmit(event) {
  event.preventDefault();
  renderPlot();
}

function resetForm() {
  elements.functionInput.value = DEFAULT_STATE.expression;
  elements.xMinInput.value = String(DEFAULT_STATE.xMin);
  elements.xMaxInput.value = String(DEFAULT_STATE.xMax);
  const selectedMode = elements.form.querySelector(`input[name="display-mode"][value="${DEFAULT_STATE.mode}"]`);
  if (selectedMode) {
    selectedMode.checked = true;
  }
  setMessage('Введите выражение и настройте диапазон. График обновляется автоматически.', 'success');
}

function getFormState() {
  return {
    expression: elements.functionInput.value.trim(),
    mode: elements.form.querySelector('input[name="display-mode"]:checked')?.value || DEFAULT_STATE.mode,
    xMin: Number(elements.xMinInput.value),
    xMax: Number(elements.xMaxInput.value)
  };
}

function validateState(state) {
  if (!state.expression) {
    throw new Error('Введите выражение функции.');
  }
  if (!Number.isFinite(state.xMin) || !Number.isFinite(state.xMax)) {
    throw new Error('Диапазон x_min и x_max должен быть числовым.');
  }
  if (state.xMin >= state.xMax) {
    throw new Error('Значение x_min должно быть меньше x_max.');
  }
}

function buildXValues(xMin, xMax, sampleCount) {
  const step = (xMax - xMin) / (sampleCount - 1);
  return Array.from({ length: sampleCount }, (_, index) => xMin + step * index);
}

function compileExpression(expression) {
  try {
    return math.compile(expression);
  } catch {
    throw new Error('Не удалось разобрать выражение. Проверьте синтаксис math.js.');
  }
}

function computeFunctionValues(compiledExpression, xValues) {
  return xValues.map((x) => {
    const y = compiledExpression.evaluate({ x });
    return Number.isFinite(y) ? y : null;
  });
}

function computeDerivativeExpression(expression) {
  try {
    return math.derivative(expression, 'x').toString();
  } catch {
    throw new Error('Не удалось вычислить производную для введённого выражения.');
  }
}

function computeIntegralValues(xValues, yValues) {
  const integralValues = [0];
  for (let index = 1; index < xValues.length; index += 1) {
    const xStep = xValues[index] - xValues[index - 1];
    const prevY = yValues[index - 1];
    const currentY = yValues[index];
    if (prevY === null || currentY === null) {
      integralValues.push(null);
      continue;
    }
    const previousIntegral = integralValues[index - 1];
    const safePreviousIntegral = previousIntegral === null ? 0 : previousIntegral;
    integralValues.push(safePreviousIntegral + ((prevY + currentY) * xStep) / 2);
  }
  return integralValues;
}

function computeReferenceValues(compiledExpression, derivativeCompiled, integralValues, xValues) {
  const referenceX = 1;
  const nearestIndex = xValues.reduce((bestIndex, currentX, index) => {
    if (Math.abs(currentX - referenceX) < Math.abs(xValues[bestIndex] - referenceX)) {
      return index;
    }
    return bestIndex;
  }, 0);

  const functionValue = evaluateSafe(compiledExpression, referenceX);
  const derivativeValue = evaluateSafe(derivativeCompiled, referenceX);
  const integralValue = integralValues[nearestIndex];

  return {
    x: referenceX,
    functionValue,
    derivativeValue,
    integralValue
  };
}

function evaluateSafe(compiledExpression, x) {
  try {
    const value = compiledExpression.evaluate({ x });
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function createTrace(name, xValues, yValues, color) {
  return {
    type: 'scatter',
    mode: 'lines',
    name,
    x: xValues,
    y: yValues,
    line: {
      width: 3,
      color,
      shape: 'spline'
    }
  };
}

function buildTraces(state, datasets) {
  const traces = [];

  if (state.mode === 'function' || state.mode === 'all') {
    traces.push(createTrace('f(x)', datasets.xValues, datasets.functionValues, '#38bdf8'));
  }
  if (state.mode === 'derivative' || state.mode === 'all') {
    traces.push(createTrace("f'(x)", datasets.xValues, datasets.derivativeValues, '#f97316'));
  }
  if (state.mode === 'integral' || state.mode === 'all') {
    traces.push(createTrace('F(x)', datasets.xValues, datasets.integralValues, '#22c55e'));
  }

  return traces;
}

function getLayout(state) {
  return {
    title: 'Координатная плоскость и выбранные графики',
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.3)',
    font: { color: '#e2e8f0', family: 'Inter, sans-serif' },
    margin: { t: 56, r: 24, b: 56, l: 56 },
    xaxis: {
      title: 'x',
      gridcolor: 'rgba(148, 163, 184, 0.14)',
      zerolinecolor: 'rgba(148, 163, 184, 0.3)',
      range: [state.xMin, state.xMax]
    },
    yaxis: {
      title: 'y',
      gridcolor: 'rgba(148, 163, 184, 0.14)',
      zerolinecolor: 'rgba(148, 163, 184, 0.3)'
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12
    },
    shapes: [
      {
        type: 'line',
        x0: 1,
        x1: 1,
        yref: 'paper',
        y0: 0,
        y1: 1,
        line: {
          color: 'rgba(248, 250, 252, 0.35)',
          width: 2,
          dash: 'dot'
        }
      }
    ],
    annotations: [
      {
        x: 1,
        y: 1,
        yref: 'paper',
        text: 'x = 1',
        showarrow: false,
        xanchor: 'left',
        yanchor: 'bottom',
        font: {
          color: '#cbd5e1'
        }
      }
    ]
  };
}

function renderValuesCard(referenceValues) {
  const formatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 5
  });

  const rows = [
    { label: 'f(1)', value: referenceValues.functionValue },
    { label: "f'(1)", value: referenceValues.derivativeValue },
    { label: 'F(1)', value: referenceValues.integralValue }
  ];

  elements.valuesCard.innerHTML = rows
    .map(({ label, value }) => {
      const textValue = value === null ? 'не определено' : formatter.format(value);
      return `<div class="value-row"><span>${label}</span><strong>${textValue}</strong></div>`;
    })
    .join('');
}

function setMessage(text, type = '') {
  elements.messageBox.textContent = text;
  elements.messageBox.className = `message-box${type ? ` ${type}` : ''}`;
}

function renderPlot() {
  try {
    if (!window.Plotly || !window.math) {
      setMessage('Библиотеки Plotly.js и math.js ещё загружаются. Подождите пару секунд.', 'error');
      return;
    }

    const state = getFormState();
    validateState(state);

    const xValues = buildXValues(state.xMin, state.xMax, DEFAULT_STATE.sampleCount);
    const compiledExpression = compileExpression(state.expression);
    const functionValues = computeFunctionValues(compiledExpression, xValues);

    const derivativeExpression = computeDerivativeExpression(state.expression);
    const compiledDerivative = compileExpression(derivativeExpression);
    const derivativeValues = computeFunctionValues(compiledDerivative, xValues);
    const integralValues = computeIntegralValues(xValues, functionValues);

    const datasets = {
      xValues,
      functionValues,
      derivativeValues,
      integralValues
    };

    const traces = buildTraces(state, datasets);
    const layout = getLayout(state);
    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['select2d', 'lasso2d']
    };

    Plotly.newPlot(elements.graph, traces, layout, config);

    const referenceValues = computeReferenceValues(compiledExpression, compiledDerivative, integralValues, xValues);
    renderValuesCard(referenceValues);
    setMessage(
      `График обновлён. Производная вычислена символьно, а первообразная построена численно на диапазоне [${state.xMin}; ${state.xMax}].`,
      'success'
    );
  } catch (error) {
    Plotly.purge(elements.graph);
    elements.valuesCard.innerHTML = '<div class="value-row"><span>Статус</span><strong>нет данных</strong></div>';
    setMessage(error.message || 'Произошла ошибка при построении графика.', 'error');
  }
}

function debounce(callback, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', init);
