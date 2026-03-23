export function debounce(callback, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), delay);
  };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function formatNumber(value) {
  if (!isFiniteNumber(value)) {
    return 'не определено';
  }

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 6
  }).format(value);
}

export function interpolateRoot(x1, y1, x2, y2) {
  if (!isFiniteNumber(x1) || !isFiniteNumber(x2) || !isFiniteNumber(y1) || !isFiniteNumber(y2)) {
    return null;
  }

  if (y1 === y2) {
    return x1;
  }

  return x1 - (y1 * (x2 - x1)) / (y2 - y1);
}
