window.MathVisualizer = window.MathVisualizer || {};

(() => {
  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function formatNumber(value) {
    if (!isFiniteNumber(value)) {
      return 'не определено';
    }

    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 6
    }).format(value);
  }

  function interpolateRoot(x1, y1, x2, y2) {
    if (!isFiniteNumber(x1) || !isFiniteNumber(x2) || !isFiniteNumber(y1) || !isFiniteNumber(y2)) {
      return null;
    }

    if (y1 === y2) {
      return x1;
    }

    return x1 - (y1 * (x2 - x1)) / (y2 - y1);
  }

  window.MathVisualizer.utils = {
    isFiniteNumber,
    formatNumber,
    interpolateRoot
  };
})();
