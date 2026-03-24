window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { PLOT_COLORS, MODE_LABELS } = window.MathVisualizer.config;
  const { isFiniteNumber } = window.MathVisualizer.utils;

  function createLineTrace({ color, hoverLabel, name, showLegend, x, y }) {
    return {
      type: 'scatter',
      mode: 'lines',
      x,
      y,
      name,
      showlegend: showLegend,
      line: {
        color,
        width: 3.4,
        shape: 'spline',
        smoothing: 0.55
      },
      hovertemplate: `${hoverLabel}<br>x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>`
    };
  }

  function createMarkerTrace({ x, y, color, name, hovertemplate, size = 10 }) {
    return {
      type: 'scatter',
      mode: 'markers',
      x,
      y,
      name,
      showlegend: false,
      marker: {
        size,
        color,
        opacity: 0.95,
        line: {
          width: 1.5,
          color: '#081224'
        }
      },
      hovertemplate
    };
  }

  function getBaseSeries(mode, datasets) {
    if (mode === 'combo') {
      return [
        {
          name: 'Функция',
          hoverLabel: 'f(x)',
          color: PLOT_COLORS.function,
          values: datasets.series.function
        },
        {
          name: 'Производная',
          hoverLabel: 'f′(x)',
          color: PLOT_COLORS.derivative,
          values: datasets.series.derivative
        },
        {
          name: 'Первообразная',
          hoverLabel: 'F(x)',
          color: PLOT_COLORS.integral,
          values: datasets.series.integral
        }
      ];
    }

    return [
      {
        name: MODE_LABELS[mode],
        hoverLabel: mode === 'function' ? 'f(x)' : mode === 'derivative' ? 'f′(x)' : 'F(x)',
        color: PLOT_COLORS[mode],
        values: datasets.series[mode]
      }
    ];
  }

  function splitSeriesAroundZero(xValues, yValues, zeroIndex) {
    const left = [];
    const right = [];

    for (let index = zeroIndex; index >= 0; index -= 1) {
      if (isFiniteNumber(yValues[index])) {
        left.push({ x: xValues[index], y: yValues[index] });
      }
    }

    for (let index = zeroIndex + 1; index < xValues.length; index += 1) {
      if (isFiniteNumber(yValues[index])) {
        right.push({ x: xValues[index], y: yValues[index] });
      }
    }

    const orderedLeft = left.reverse();

    return {
      x: [...orderedLeft.map((point) => point.x), null, ...right.map((point) => point.x)],
      y: [...orderedLeft.map((point) => point.y), null, ...right.map((point) => point.y)]
    };
  }

  function gatherRangeValues(mode, datasets) {
    if (mode === 'combo') {
      return [
        ...datasets.series.function,
        ...datasets.series.derivative,
        ...datasets.series.integral
      ].filter(isFiniteNumber);
    }

    return datasets.series[mode].filter(isFiniteNumber);
  }

  function computeSmartYRange(mode, datasets) {
    const finiteValues = gatherRangeValues(mode, datasets);
    if (finiteValues.length === 0) {
      return [-6, 6];
    }

    const sorted = [...finiteValues].sort((left, right) => left - right);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const low = sorted[Math.floor((sorted.length - 1) * 0.14)];
    const high = sorted[Math.floor((sorted.length - 1) * 0.86)];
    const rawSpan = Math.max(max - min, 1e-6);
    const focusedSpan = Math.max(high - low, 1e-6);
    const useFocused = rawSpan / focusedSpan > 2.5;
    const lower = useFocused ? low : min;
    const upper = useFocused ? high : max;
    const span = Math.max(upper - lower, 1e-6);
    const padding = Math.max(span * 0.12, 1);

    return [Math.min(lower - padding, -2), Math.max(upper + padding, 2)];
  }

  function getNiceStep(span, targetLines) {
    const rawStep = Math.max(span / targetLines, 1);
    const power = 10 ** Math.floor(Math.log10(rawStep));
    const normalized = rawStep / power;

    if (normalized <= 1) {
      return 1 * power;
    }

    if (normalized <= 2) {
      return 2 * power;
    }

    if (normalized <= 5) {
      return 5 * power;
    }

    return 10 * power;
  }

  function buildLayout(state, datasets) {
    const yRange = computeSmartYRange(state.mode, datasets);
    const isCombo = state.mode === 'combo';
    const xSpan = state.viewport.xMax - state.viewport.xMin;

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(5, 26, 18, 0.18)',
      font: {
        color: '#dbeafe',
        family: 'Inter, sans-serif'
      },
      margin: {
        t: 24,
        r: 20,
        b: 58,
        l: 72
      },
      transition: {
        duration: 340,
        easing: 'cubic-in-out'
      },
      showlegend: isCombo,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: PLOT_COLORS.legendBg,
        bordercolor: 'rgba(96, 165, 250, 0.22)',
        borderwidth: 1,
        font: {
          color: PLOT_COLORS.comboText,
          size: 12
        }
      },
      hoverlabel: {
        bgcolor: 'rgba(8, 18, 36, 0.9)',
        bordercolor: 'rgba(125, 211, 252, 0.34)',
        font: {
          color: '#eff6ff'
        }
      },
      dragmode: 'pan',
      hovermode: 'closest',
      uirevision: `${state.mode}-viewport`,
      xaxis: {
        title: 'X',
        range: [state.viewport.xMin, state.viewport.xMax],
        tickmode: 'linear',
        tick0: 0,
        dtick: getNiceStep(xSpan, 10),
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axisStrong,
        zerolinewidth: 2,
        tickcolor: 'rgba(96, 165, 250, 0.24)',
        linecolor: PLOT_COLORS.axis,
        linewidth: 2,
        showline: true
      },
      yaxis: {
        title: 'Y',
        range: yRange,
        tickmode: 'linear',
        tick0: 0,
        dtick: getNiceStep(yRange[1] - yRange[0], 12),
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axisStrong,
        zerolinewidth: 2,
        tickcolor: 'rgba(96, 165, 250, 0.24)',
        linecolor: PLOT_COLORS.axis,
        linewidth: 2,
        showline: true,
        automargin: true
      },
      shapes: [
        {
          type: 'line',
          x0: state.viewport.xMin,
          x1: state.viewport.xMax,
          y0: 0,
          y1: 0,
          line: {
            color: PLOT_COLORS.axisStrong,
            width: 2
          }
        },
        {
          type: 'line',
          x0: 0,
          x1: 0,
          y0: yRange[0],
          y1: yRange[1],
          line: {
            color: PLOT_COLORS.axisStrong,
            width: 2
          }
        }
      ]
    };
  }

  function createExtremaTrace(datasets) {
    if (datasets.extrema.length === 0) {
      return null;
    }

    return createMarkerTrace({
      x: datasets.extrema.map((point) => point.x),
      y: datasets.extrema.map((point) => point.y),
      color: PLOT_COLORS.extrema,
      name: 'Экстремумы',
      hovertemplate: 'Экстремум<br>x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>',
      size: 10
    });
  }

  function buildPlotModel(state, datasets) {
    const baseSeries = getBaseSeries(state.mode, datasets);
    const lineTraces = baseSeries.map((series) => {
      const points = splitSeriesAroundZero(datasets.xValues, series.values, datasets.zeroIndex);

      return createLineTrace({
        color: series.color,
        hoverLabel: series.hoverLabel,
        name: series.name,
        showLegend: state.mode === 'combo',
        x: points.x,
        y: points.y
      });
    });

    const extras = [
      createMarkerTrace({
        x: [0],
        y: [0],
        color: PLOT_COLORS.origin,
        name: 'Начало координат',
        hovertemplate: 'Начало координат<br>x=0<br>y=0<extra></extra>',
        size: 8
      })
    ];

    const extremaTrace = createExtremaTrace(datasets);
    if (extremaTrace && (state.mode === 'function' || state.mode === 'combo')) {
      extras.push(extremaTrace);
    }

    return [...lineTraces, ...extras];
  }

  function renderPlot(graphElement, state, datasets) {
    const traces = buildPlotModel(state, datasets);
    const layout = buildLayout(state, datasets);
    const config = {
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset',
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d']
    };

    return window.Plotly.react(graphElement, traces, layout, config);
  }

  function bindViewportEvents(graphElement, onViewportChange) {
    graphElement.on('plotly_relayout', (eventData) => {
      const xMin = eventData['xaxis.range[0]'];
      const xMax = eventData['xaxis.range[1]'];

      if (typeof xMin === 'number' && typeof xMax === 'number' && Math.abs(xMax - xMin) > 1e-6) {
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
