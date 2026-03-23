import { interpolateRoot, isFiniteNumber } from './utils.js';

export function buildXValues(xMin, xMax, sampleCount) {
  const step = (xMax - xMin) / (sampleCount - 1);
  return Array.from({ length: sampleCount }, (_, index) => xMin + step * index);
}

export function compileExpression(expression) {
  try {
    return window.math.compile(expression);
  } catch {
    throw new Error('Не удалось разобрать выражение. Проверьте синтаксис math.js.');
  }
}

export function deriveExpression(expression) {
  try {
    return window.math.derivative(expression, 'x').toString();
  } catch {
    throw new Error('Не удалось вычислить производную для введённого выражения.');
  }
}

export function evaluateCompiled(compiledExpression, x) {
  try {
    const rawValue = compiledExpression.evaluate({ x });
    return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null;
  } catch {
    return null;
  }
}

export function evaluateSeries(compiledExpression, xValues) {
  return xValues.map((x) => evaluateCompiled(compiledExpression, x));
}

export function computeIntegralSeries(xValues, functionValues) {
  const integralValues = [0];
  let lastFiniteIntegral = 0;

  for (let index = 1; index < xValues.length; index += 1) {
    const xStep = xValues[index] - xValues[index - 1];
    const previousY = functionValues[index - 1];
    const currentY = functionValues[index];
    const previousIntegral = integralValues[index - 1];

    if (!isFiniteNumber(previousY) || !isFiniteNumber(currentY)) {
      integralValues.push(null);
      continue;
    }

    const baseIntegral = isFiniteNumber(previousIntegral) ? previousIntegral : lastFiniteIntegral;
    const nextIntegral = baseIntegral + ((previousY + currentY) * xStep) / 2;
    integralValues.push(nextIntegral);
    lastFiniteIntegral = nextIntegral;
  }

  return integralValues;
}

export function findNearestIndex(xValues, targetX) {
  return xValues.reduce((bestIndex, currentX, index) => {
    const bestDistance = Math.abs(xValues[bestIndex] - targetX);
    const currentDistance = Math.abs(currentX - targetX);
    return currentDistance < bestDistance ? index : bestIndex;
  }, 0);
}

export function getAnalysisValues(x0, compiledFunction, compiledDerivative, xValues, integralValues) {
  const nearestIndex = findNearestIndex(xValues, x0);

  return {
    x0,
    functionValue: evaluateCompiled(compiledFunction, x0),
    derivativeValue: evaluateCompiled(compiledDerivative, x0),
    integralValue: integralValues[nearestIndex] ?? null
  };
}

export function findExtrema(xValues, derivativeValues, compiledFunction) {
  const extrema = [];

  for (let index = 1; index < derivativeValues.length; index += 1) {
    const previousDerivative = derivativeValues[index - 1];
    const currentDerivative = derivativeValues[index];
    const previousX = xValues[index - 1];
    const currentX = xValues[index];

    if (!isFiniteNumber(previousDerivative) || !isFiniteNumber(currentDerivative)) {
      continue;
    }

    if (previousDerivative === 0 || currentDerivative === 0 || previousDerivative * currentDerivative < 0) {
      const extremumX = previousDerivative === 0
        ? previousX
        : currentDerivative === 0
          ? currentX
          : interpolateRoot(previousX, previousDerivative, currentX, currentDerivative);

      if (!isFiniteNumber(extremumX)) {
        continue;
      }

      const extremumY = evaluateCompiled(compiledFunction, extremumX);
      if (!isFiniteNumber(extremumY)) {
        continue;
      }

      const lastPoint = extrema.at(-1);
      if (lastPoint && Math.abs(lastPoint.x - extremumX) < 1e-3) {
        continue;
      }

      extrema.push({
        x: extremumX,
        y: extremumY,
        label: 'экстремум'
      });
    }
  }

  return extrema;
}

export function runMathPipeline(state) {
  const xValues = buildXValues(state.xMin, state.xMax, state.sampleCount);
  const compiledFunction = compileExpression(state.expression);
  const functionValues = evaluateSeries(compiledFunction, xValues);
  const derivativeExpression = deriveExpression(state.expression);
  const compiledDerivative = compileExpression(derivativeExpression);
  const derivativeValues = evaluateSeries(compiledDerivative, xValues);
  const integralValues = computeIntegralSeries(xValues, functionValues);
  const analysis = getAnalysisValues(state.x0, compiledFunction, compiledDerivative, xValues, integralValues);
  const extrema = findExtrema(xValues, derivativeValues, compiledFunction);

  return {
    xValues,
    derivativeExpression,
    series: {
      function: functionValues,
      derivative: derivativeValues,
      integral: integralValues
    },
    analysis,
    extrema
  };
}
