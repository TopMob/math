window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { PLOT_COLORS, MODE_LABELS } = window.MathVisualizer.config;

  function createFunctionTrace(xValues, yValues) {
    return {
      type: 'scatter',
      mode: 'lines',
      x: xValues,
      y: yValues,
      line: {
        color: PLOT_COLORS.function,
        width: 3
      },
      hovertemplate: 'x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>'
    };
  }

  function createDerivativeTrace(xValues, yValues) {
    return {
      type: 'scatter',
      mode: 'lines',
      x: xValues,
      y: yValues,
      line: {
        color: PLOT_COLORS.derivative,
        width: 3
      },
      hovertemplate: 'x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>'
    };
  }

  function createIntegralTrace(xValues, yValues) {
    return {
      type: 'scatter',
      mode: 'lines',
      x: xValues,
      y: yValues,
      line: {
        color: PLOT_COLORS.integral,
        width: 3
      },
      hovertemplate: 'x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>'
    };
  }

  function createExtremumMarkers(extrema) {
    return {
      type: 'scatter',
      mode: 'markers',
      x: extrema.map((point) => point.x),
      y: extrema.map((point) => point.y),
      marker: {
        size: 9,
        color: PLOT_COLORS.extrema,
        line: {
          width: 1,
          color: '#111827'
        }
      },
      hovertemplate: 'Экстремум<br>x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>'
    };
  }

  function buildTraces(state, datasets) {
    if (state.mode === 'function') {
      const traces = [createFunctionTrace(datasets.xValues, datasets.series.function)];
      if (datasets.extrema.length > 0) {
        traces.push(createExtremumMarkers(datasets.extrema));
      }
      return traces;
    }

    if (state.mode === 'derivative') {
      return [createDerivativeTrace(datasets.xValues, datasets.series.derivative)];
    }

    return [createIntegralTrace(datasets.xValues, datasets.series.integral)];
  }

  function buildLayout(state) {
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(2, 6, 23, 0.16)',
      font: {
        color: '#e2e8f0',
        family: 'Inter, sans-serif'
      },
      margin: {
        t: 18,
        r: 18,
        b: 48,
        l: 52
      },
      showlegend: false,
      dragmode: 'pan',
      hovermode: 'closest',
      xaxis: {
        title: MODE_LABELS[state.mode],
        range: [state.viewport.xMin, state.viewport.xMax],
        gridcolor: 'rgba(148, 163, 184, 0.14)',
        zerolinecolor: 'rgba(148, 163, 184, 0.26)',
        showspikes: true,
        spikemode: 'across'
      },
      yaxis: {
        autorange: true,
        gridcolor: 'rgba(148, 163, 184, 0.14)',
        zerolinecolor: 'rgba(148, 163, 184, 0.26)',
        automargin: true,
        fixedrange: false
      },
      uirevision: `${state.mode}:${state.viewport.xMin}:${state.viewport.xMax}`
    };
  }

  function renderPlot(graphElement, state, datasets) {
    const traces = buildTraces(state, datasets);
    const layout = buildLayout(state);
    const config = {
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset',
      modeBarButtonsToRemove: ['select2d', 'lasso2d']
    };

    return window.Plotly.react(graphElement, traces, layout, config);
  }

  function bindViewportEvents(graphElement, onViewportChange) {
    graphElement.on('plotly_relayout', (eventData) => {
      const xMin = eventData['xaxis.range[0]'];
      const xMax = eventData['xaxis.range[1]'];

      if (typeof xMin === 'number' && typeof xMax === 'number') {
        onViewportChange(xMin, xMax);
      }
    });
  }

  function purgePlot(graphElement) {
    if (window.Plotly) {
      window.Plotly.purge(graphElement);
    }
  }

  window.MathVisualizer.plotManager = {
    renderPlot,
    bindViewportEvents,
    purgePlot
  };
})();
