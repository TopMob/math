import { PLOT_COLORS } from './config.js';

export function createFunctionTrace(xValues, yValues) {
  return {
    type: 'scatter',
    mode: 'lines',
    name: 'f(x)',
    x: xValues,
    y: yValues,
    line: {
      color: PLOT_COLORS.function,
      width: 3
    },
    hovertemplate: 'x=%{x:.4f}<br>f(x)=%{y:.4f}<extra></extra>'
  };
}

export function createDerivativeTrace(xValues, yValues) {
  return {
    type: 'scatter',
    mode: 'lines',
    name: "f'(x)",
    x: xValues,
    y: yValues,
    line: {
      color: PLOT_COLORS.derivative,
      width: 3
    },
    hovertemplate: 'x=%{x:.4f}<br>f\'(x)=%{y:.4f}<extra></extra>'
  };
}

export function createIntegralTrace(xValues, yValues) {
  return {
    type: 'scatter',
    mode: 'lines',
    name: 'F(x)',
    x: xValues,
    y: yValues,
    line: {
      color: PLOT_COLORS.integral,
      width: 3
    },
    hovertemplate: 'x=%{x:.4f}<br>F(x)=%{y:.4f}<extra></extra>'
  };
}

export function createExtremumMarkers(extrema) {
  return {
    type: 'scatter',
    mode: 'markers+text',
    name: 'Экстремумы',
    x: extrema.map((point) => point.x),
    y: extrema.map((point) => point.y),
    text: extrema.map((point) => point.label),
    textposition: 'top center',
    marker: {
      size: 10,
      color: PLOT_COLORS.extrema,
      line: {
        width: 1,
        color: '#111827'
      }
    },
    hovertemplate: 'x=%{x:.4f}<br>y=%{y:.4f}<extra>Экстремум</extra>'
  };
}

export function createReferenceLine(x0) {
  return {
    type: 'line',
    x0,
    x1: x0,
    yref: 'paper',
    y0: 0,
    y1: 1,
    line: {
      color: PLOT_COLORS.reference,
      width: 2,
      dash: 'dot'
    }
  };
}

export function buildTraces(state, datasets) {
  const traces = [];

  if (state.visibleSeries.function) {
    traces.push(createFunctionTrace(datasets.xValues, datasets.series.function));
    if (datasets.extrema.length > 0) {
      traces.push(createExtremumMarkers(datasets.extrema));
    }
  }

  if (state.visibleSeries.derivative) {
    traces.push(createDerivativeTrace(datasets.xValues, datasets.series.derivative));
  }

  if (state.visibleSeries.integral) {
    traces.push(createIntegralTrace(datasets.xValues, datasets.series.integral));
  }

  return traces;
}

export function buildLayout(state) {
  return {
    title: 'Координатная плоскость',
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(2, 6, 23, 0.16)',
    font: {
      color: '#e2e8f0',
      family: 'Inter, sans-serif'
    },
    margin: {
      t: 56,
      r: 20,
      b: 56,
      l: 60
    },
    hovermode: 'closest',
    xaxis: {
      title: 'x',
      range: [state.xMin, state.xMax],
      gridcolor: 'rgba(148, 163, 184, 0.14)',
      zerolinecolor: 'rgba(148, 163, 184, 0.26)',
      showspikes: true,
      spikemode: 'across'
    },
    yaxis: {
      title: 'y',
      gridcolor: 'rgba(148, 163, 184, 0.14)',
      zerolinecolor: 'rgba(148, 163, 184, 0.26)',
      automargin: true
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12
    },
    shapes: [createReferenceLine(state.x0)],
    annotations: [
      {
        x: state.x0,
        y: 1,
        yref: 'paper',
        text: `x0 = ${state.x0}`,
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

export function renderPlot(graphElement, state, datasets) {
  const traces = buildTraces(state, datasets);
  const layout = buildLayout(state);
  const config = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
    modeBarButtonsToAdd: ['resetScale2d'],
    modeBarButtonsToRemove: ['select2d', 'lasso2d']
  };

  return window.Plotly.react(graphElement, traces, layout, config);
}

export function purgePlot(graphElement) {
  if (window.Plotly) {
    window.Plotly.purge(graphElement);
  }
}

export function autoscalePlot(graphElement) {
  if (window.Plotly) {
    window.Plotly.relayout(graphElement, {
      'xaxis.autorange': true,
      'yaxis.autorange': true
    });
  }
}
