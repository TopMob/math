export const DEFAULT_FORM_STATE = {
  expression: 'x^3 - 2*x^2 + x + 1',
  xMin: -10,
  xMax: 10,
  x0: 1,
  sampleCount: 401,
  autoUpdate: true,
  visibleSeries: {
    function: true,
    derivative: true,
    integral: true
  },
  selectedExample: 'x^3 - 2*x^2 + x + 1'
};

export const EXAMPLES = [
  { label: 'x^3 - 2*x^2 + x + 1', value: 'x^3 - 2*x^2 + x + 1' },
  { label: 'sin(x)', value: 'sin(x)' },
  { label: 'cos(x) + x', value: 'cos(x) + x' },
  { label: 'exp(x / 3)', value: 'exp(x / 3)' },
  { label: 'x^4 - 4*x^2', value: 'x^4 - 4*x^2' },
  { label: '1 / (x^2 + 1)', value: '1 / (x^2 + 1)' }
];

export const SAMPLE_LIMITS = {
  min: 50,
  max: 3000
};

export const PLOT_COLORS = {
  function: '#38bdf8',
  derivative: '#f97316',
  integral: '#22c55e',
  reference: 'rgba(226, 232, 240, 0.42)',
  extrema: '#facc15'
};
