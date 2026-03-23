window.MathVisualizer = window.MathVisualizer || {};

window.MathVisualizer.utils = {
  isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  },

  formatNumber(value) {
    if (!this.isFiniteNumber(value)) {
      return 'не определено';
    }

    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 6
    }).format(value);
  },

  interpolateRoot(x1, y1, x2, y2) {
    if (!this.isFiniteNumber(x1) || !this.isFiniteNumber(x2) || !this.isFiniteNumber(y1) || !this.isFiniteNumber(y2)) {
      return null;
    }

    if (y1 === y2) {
      return x1;
    }

    return x1 - (y1 * (x2 - x1)) / (y2 - y1);
  }
};
