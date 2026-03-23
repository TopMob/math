window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { PLOT_COLORS, MODE_LABELS, ANIMATION } = window.MathVisualizer.config;
  const { isFiniteNumber } = window.MathVisualizer.utils;

  function createLineTrace({ color, hoverLabel, name, showLegend }) {
    return {
      type: 'scatter',
      mode: 'lines',
      x: [],
      y: [],
      name,
      showlegend: showLegend,
      line: {
        color,
        width: 3.2
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
        line: {
          width: 1.5,
          color: '#021015'
        }
      },
      hovertemplate
    };
  }

  function getBaseSeries(mode, datasets) {
    if (mode === 'combo') {
      return [
        {
          key: 'function',
          name: 'Функция',
          hoverLabel: 'f(x)',
          color: PLOT_COLORS.function,
          values: datasets.series.function
        },
        {
          key: 'derivative',
          name: 'Производная',
          hoverLabel: 'f′(x)',
          color: PLOT_COLORS.derivative,
          values: datasets.series.derivative
        },
        {
          key: 'integral',
          name: 'Первообразная',
          hoverLabel: 'F(x)',
          color: PLOT_COLORS.integral,
          values: datasets.series.integral
        }
      ];
    }

    return [
      {
        key: mode,
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

    for (let index = zeroIndex; index < xValues.length; index += 1) {
      if (isFiniteNumber(yValues[index])) {
        right.push({ x: xValues[index], y: yValues[index] });
      }
    }

    return {
      left,
      right
    };
  }

  function buildAnimatedCoordinates(splitSeries, progress) {
    const leftCount = Math.max(1, Math.round(splitSeries.left.length * progress));
    const rightCount = Math.max(1, Math.round(splitSeries.right.length * progress));
    const leftSlice = splitSeries.left.slice(0, leftCount);
    const rightSlice = splitSeries.right.slice(0, rightCount);

    return {
      x: [...leftSlice.map((point) => point.x), null, ...rightSlice.map((point) => point.x)],
      y: [...leftSlice.map((point) => point.y), null, ...rightSlice.map((point) => point.y)]
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
    const lowIndex = Math.floor((sorted.length - 1) * 0.12);
    const highIndex = Math.floor((sorted.length - 1) * 0.88);
    const low = sorted[lowIndex];
    const high = sorted[highIndex];
    const rawSpan = Math.max(max - min, 1e-6);
    const focusedSpan = Math.max(high - low, 1e-6);
    const useFocused = rawSpan / focusedSpan > 2.6;
    const lower = useFocused ? low : min;
    const upper = useFocused ? high : max;
    const span = Math.max(upper - lower, 1e-6);
    const padding = Math.max(span * 0.14, 1.25);

    return [Math.min(lower - padding, -2), Math.max(upper + padding, 2)];
  }

  function buildLayout(state, datasets) {
    const yRange = computeSmartYRange(state.mode, datasets);
    const isCombo = state.mode === 'combo';

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(1, 11, 16, 0.16)',
      font: {
        color: '#dcfdf7',
        family: 'Inter, sans-serif'
      },
      margin: {
        t: 24,
        r: 20,
        b: 58,
        l: 72
      },
      showlegend: isCombo,
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: PLOT_COLORS.legendBg,
        bordercolor: 'rgba(74, 222, 128, 0.2)',
        borderwidth: 1,
        font: {
          color: PLOT_COLORS.comboText,
          size: 12
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
        dtick: 1,
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axisStrong,
        zerolinewidth: 2,
        tickcolor: 'rgba(120, 255, 230, 0.24)',
        linecolor: PLOT_COLORS.axis,
        linewidth: 2,
        showline: true,
        showspikes: true,
        spikecolor: 'rgba(88, 214, 255, 0.32)',
        spikethickness: 1,
        spikemode: 'across'
      },
      yaxis: {
        title: 'Y',
        range: yRange,
        tickmode: 'linear',
        tick0: 0,
        dtick: 1,
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axisStrong,
        zerolinewidth: 2,
        tickcolor: 'rgba(120, 255, 230, 0.24)',
        linecolor: PLOT_COLORS.axis,
        linewidth: 2,
        showline: true,
        automargin: true,
        scaleanchor: false
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

  function buildPlotModel(state, datasets) {
    const baseSeries = getBaseSeries(state.mode, datasets);
    const traces = baseSeries.map((series) => {
      const splitSeries = splitSeriesAroundZero(datasets.xValues, series.values, datasets.zeroIndex);
      return {
        splitSeries,
        trace: createLineTrace({
          color: series.color,
          hoverLabel: series.hoverLabel,
          name: series.name,
          showLegend: state.mode === 'combo'
        })
      };
    });

    const extras = [
      createMarkerTrace({
        x: [0],
        y: [0],
        color: PLOT_COLORS.origin,
        name: 'Начало координат',
        hovertemplate: 'Начало координат<br>x=0<br>y=0<extra></extra>',
        size: 9
      })
    ];

    if (state.mode === 'function' && datasets.extrema.length > 0) {
      extras.push(createMarkerTrace({
        x: datasets.extrema.map((point) => point.x),
        y: datasets.extrema.map((point) => point.y),
        color: PLOT_COLORS.extrema,
        name: 'Экстремумы',
        hovertemplate: 'Экстремум<br>x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>',
        size: 11
      }));
    }

    return {
      lineTraces: traces,
      traces: [...traces.map((entry) => entry.trace), ...extras]
    };
  }

  function setAnimatedFrame(graphElement, lineTraces, progress) {
    window.Plotly.restyle(
      graphElement,
      {
        x: lineTraces.map((entry) => [buildAnimatedCoordinates(entry.splitSeries, progress).x]),
        y: lineTraces.map((entry) => [buildAnimatedCoordinates(entry.splitSeries, progress).y])
      },
      lineTraces.map((_, index) => index)
    );
  }

  function cancelAnimation(graphElement) {
    if (graphElement.__mathVisualizerAnimationFrame) {
      window.cancelAnimationFrame(graphElement.__mathVisualizerAnimationFrame);
      graphElement.__mathVisualizerAnimationFrame = null;
    }
  }

  function animatePlot(graphElement, lineTraces) {
    cancelAnimation(graphElement);
    const totalFrames = Math.max(2, Math.round((ANIMATION.duration / 1000) * ANIMATION.fps));

    function step(frameIndex) {
      const progress = Math.min(frameIndex / totalFrames, 1);
      setAnimatedFrame(graphElement, lineTraces, progress);

      if (frameIndex < totalFrames) {
        graphElement.__mathVisualizerAnimationFrame = window.requestAnimationFrame(() => step(frameIndex + 1));
      }
    }

    step(1);
  }

  function renderStaticPlot(graphElement, lineTraces) {
    setAnimatedFrame(graphElement, lineTraces, 1);
  }

  function renderPlot(graphElement, state, datasets, options = {}) {
    const { animate = false } = options;
    const plotModel = buildPlotModel(state, datasets);
    const layout = buildLayout(state, datasets);
    const config = {
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset',
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d']
    };

    return window.Plotly.react(graphElement, plotModel.traces, layout, config).then(() => {
      if (animate) {
        animatePlot(graphElement, plotModel.lineTraces);
        return;
      }

      renderStaticPlot(graphElement, plotModel.lineTraces);
    });
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
    cancelAnimation(graphElement);
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
