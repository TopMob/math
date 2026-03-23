window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { isFiniteNumber } = window.MathVisualizer.utils;

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
      const rawValue = compiledExpression.evaluate({ x });
      return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null;
    } catch {
      return null;
    }
  }

  function evaluateSeries(compiledExpression, xValues) {
    return xValues.map((x) => evaluateCompiled(compiledExpression, x));
  }

  function computeIntegralSeries(xValues, functionValues) {
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

  function refineRoot(compiledDerivative, leftX, rightX) {
    let left = leftX;
    let right = rightX;
    let leftValue = evaluateCompiled(compiledDerivative, left);
    let rightValue = evaluateCompiled(compiledDerivative, right);

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
        rightValue = middleValue;
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
      series: {
        function: functionValues,
        derivative: derivativeValues,
        integral: integralValues
      },
      extrema
    };
  }

  window.MathVisualizer.mathEngine = {
    runMathPipeline
  };
})();
