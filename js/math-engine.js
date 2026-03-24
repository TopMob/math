window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { isFiniteNumber, interpolateRoot } = window.MathVisualizer.utils;

  function toFiniteNumber(rawValue) {
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      return rawValue;
    }

    if (rawValue && typeof rawValue.valueOf === 'function') {
      const coerced = rawValue.valueOf();
      if (typeof coerced === 'number' && Number.isFinite(coerced)) {
        return coerced;
      }
    }

    return null;
  }

  function buildXValues(xMin, xMax, sampleCount) {
    const step = (xMax - xMin) / (sampleCount - 1);
    return Array.from({ length: sampleCount }, (_, index) => xMin + step * index);
  }

  function compileExpression(expression) {
    try {
      return window.math.compile(expression);
    } catch {
      throw new Error('Не удалось разобрать выражение.');
    }
  }

  function deriveExpression(expression) {
    try {
      return window.math.derivative(expression, 'x').toString();
    } catch {
      throw new Error('Не удалось вычислить производную.');
    }
  }

  function evaluateCompiled(compiledExpression, x) {
    try {
      return toFiniteNumber(compiledExpression.evaluate({ x }));
    } catch {
      return null;
    }
  }

  function evaluateSeries(compiledExpression, xValues) {
    return xValues.map((x) => evaluateCompiled(compiledExpression, x));
  }

  function getZeroSplitIndex(xValues) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    xValues.forEach((value, index) => {
      const distance = Math.abs(value);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function computeIntegralSeries(xValues, functionValues) {
    const zeroIndex = getZeroSplitIndex(xValues);
    const integralValues = new Array(xValues.length).fill(null);
    integralValues[zeroIndex] = 0;

    let forwardIntegral = 0;
    for (let index = zeroIndex + 1; index < xValues.length; index += 1) {
      const xStep = xValues[index] - xValues[index - 1];
      const previousY = functionValues[index - 1];
      const currentY = functionValues[index];

      if (!isFiniteNumber(previousY) || !isFiniteNumber(currentY)) {
        integralValues[index] = null;
        continue;
      }

      forwardIntegral += ((previousY + currentY) * xStep) / 2;
      integralValues[index] = forwardIntegral;
    }

    let backwardIntegral = 0;
    for (let index = zeroIndex - 1; index >= 0; index -= 1) {
      const xStep = xValues[index + 1] - xValues[index];
      const leftY = functionValues[index];
      const rightY = functionValues[index + 1];

      if (!isFiniteNumber(leftY) || !isFiniteNumber(rightY)) {
        integralValues[index] = null;
        continue;
      }

      backwardIntegral -= ((leftY + rightY) * xStep) / 2;
      integralValues[index] = backwardIntegral;
    }

    return integralValues;
  }

  function refineRoot(compiledDerivative, leftX, rightX) {
    let left = leftX;
    let right = rightX;
    let leftValue = evaluateCompiled(compiledDerivative, left);
    const rightValue = evaluateCompiled(compiledDerivative, right);

    if (!isFiniteNumber(leftValue) || !isFiniteNumber(rightValue)) {
      return null;
    }

    if (leftValue === 0) {
      return left;
    }

    if (rightValue === 0) {
      return right;
    }

    if (leftValue * rightValue > 0) {
      return null;
    }

    for (let iteration = 0; iteration < 48; iteration += 1) {
      const middle = (left + right) / 2;
      const middleValue = evaluateCompiled(compiledDerivative, middle);

      if (!isFiniteNumber(middleValue)) {
        return null;
      }

      if (Math.abs(middleValue) < 1e-10 || Math.abs(right - left) < 1e-7) {
        return middle;
      }

      if (leftValue * middleValue <= 0) {
        right = middle;
      } else {
        left = middle;
        leftValue = middleValue;
      }
    }

    return (left + right) / 2;
  }

  function findExtrema(xValues, derivativeValues, compiledFunction, compiledDerivative) {
    const extrema = [];

    for (let index = 1; index < derivativeValues.length; index += 1) {
      const previousDerivative = derivativeValues[index - 1];
      const currentDerivative = derivativeValues[index];
      const previousX = xValues[index - 1];
      const currentX = xValues[index];

      if (!isFiniteNumber(previousDerivative) || !isFiniteNumber(currentDerivative)) {
        continue;
      }

      let extremumX = null;

      if (previousDerivative === 0) {
        extremumX = previousX;
      } else if (currentDerivative === 0) {
        extremumX = currentX;
      } else if (previousDerivative * currentDerivative < 0) {
        extremumX = refineRoot(compiledDerivative, previousX, currentX);
      }

      if (!isFiniteNumber(extremumX)) {
        continue;
      }

      const extremumY = evaluateCompiled(compiledFunction, extremumX);
      if (!isFiniteNumber(extremumY)) {
        continue;
      }

      const lastPoint = extrema[extrema.length - 1];
      if (lastPoint && Math.abs(lastPoint.x - extremumX) < 1e-4) {
        continue;
      }

      extrema.push({
        x: extremumX,
        y: extremumY
      });
    }

    return extrema;
  }

  function computeSeriesStats(xValues, values) {
    const visibleValues = values.filter(isFiniteNumber);
    if (visibleValues.length === 0) {
      return {
        min: null,
        max: null,
        atZero: null
      };
    }

    const zeroIndex = getZeroSplitIndex(xValues);

    return {
      min: Math.min(...visibleValues),
      max: Math.max(...visibleValues),
      atZero: isFiniteNumber(values[zeroIndex]) ? values[zeroIndex] : null
    };
  }

  function findZeroCrossings(xValues, values) {
    const roots = [];

    for (let index = 1; index < values.length; index += 1) {
      const previousValue = values[index - 1];
      const currentValue = values[index];
      const previousX = xValues[index - 1];
      const currentX = xValues[index];

      if (!isFiniteNumber(previousValue) || !isFiniteNumber(currentValue)) {
        continue;
      }

      let root = null;

      if (previousValue === 0) {
        root = previousX;
      } else if (currentValue === 0) {
        root = currentX;
      } else if (previousValue * currentValue < 0) {
        root = interpolateRoot(previousX, previousValue, currentX, currentValue);
      }

      if (!isFiniteNumber(root)) {
        continue;
      }

      const lastRoot = roots[roots.length - 1];
      if (isFiniteNumber(lastRoot) && Math.abs(lastRoot - root) < 1e-4) {
        continue;
      }

      roots.push(root);
    }

    return roots;
  }

  function runMathPipeline(state) {
    const { xMin, xMax } = state.viewport;
    const xValues = buildXValues(xMin, xMax, state.sampleCount);
    const compiledFunction = compileExpression(state.expression);
    const functionValues = evaluateSeries(compiledFunction, xValues);
    const derivativeExpression = deriveExpression(state.expression);
    const compiledDerivative = compileExpression(derivativeExpression);
    const derivativeValues = evaluateSeries(compiledDerivative, xValues);
    const integralValues = computeIntegralSeries(xValues, functionValues);
    const extrema = findExtrema(xValues, derivativeValues, compiledFunction, compiledDerivative);

    return {
      xValues,
      zeroIndex: getZeroSplitIndex(xValues),
      series: {
        function: functionValues,
        derivative: derivativeValues,
        integral: integralValues
      },
      stats: {
        function: computeSeriesStats(xValues, functionValues),
        derivative: computeSeriesStats(xValues, derivativeValues),
        integral: computeSeriesStats(xValues, integralValues)
      },
      roots: {
        function: findZeroCrossings(xValues, functionValues),
        derivative: findZeroCrossings(xValues, derivativeValues),
        integral: findZeroCrossings(xValues, integralValues)
      },
      extrema
    };
  }

  window.MathVisualizer.mathEngine = {
    runMathPipeline
  };
})();
