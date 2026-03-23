window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { PLOT_COLORS, MODE_LABELS, ANIMATION } = window.MathVisualizer.config;
  const { isFiniteNumber } = window.MathVisualizer.utils;

  function createLineTrace(color, hoverLabel, width, opacity = 1) {
    return {
      type: 'scatter',
      mode: 'lines',
      x: [],
      y: [],
      line: {
        color,
        width,
        shape: 'spline',
        smoothing: 0.75
      },
      opacity,
      hovertemplate: `${hoverLabel}<br>x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>`
    };
  }

  function createExtremumMarkers(extrema) {
    return {
      type: 'scatter',
      mode: 'markers',
      x: extrema.map((point) => point.x),
      y: extrema.map((point) => point.y),
      marker: {
        size: 12,
        color: PLOT_COLORS.extrema,
        line: {
          width: 2,
          color: '#0f172a'
        }
      },
      hovertemplate: 'Экстремум<br>x=%{x:.4f}<br>y=%{y:.4f}<extra></extra>'
    };
  }

  function getModeMeta(mode) {
    if (mode === 'derivative') {
      return {
        color: PLOT_COLORS.derivative,
        hoverLabel: 'f′(x)'
      };
    }

    if (mode === 'integral') {
      return {
        color: PLOT_COLORS.integral,
        hoverLabel: 'F(x)'
      };
    }

    return {
      color: PLOT_COLORS.function,
      hoverLabel: 'f(x)'
    };
  }

  function getSeriesForMode(mode, datasets) {
    return datasets.series[mode];
  }

  function splitSeriesAroundZero(xValues, yValues, zeroIndex) {
    const zeroX = xValues[zeroIndex];
    const zeroY = yValues[zeroIndex];
    const centerX = isFiniteNumber(zeroX) ? zeroX : 0;
    const centerY = isFiniteNumber(zeroY) ? zeroY : 0;
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

    if (left.length === 0) {
      left.push({ x: centerX, y: centerY });
    }

    if (right.length === 0) {
      right.push({ x: centerX, y: centerY });
    }

    return {
      left,
      right,
      centerX,
      centerY
    };
  }

  function computeSmartYRange(yValues) {
    const finiteValues = yValues.filter(isFiniteNumber);
    if (finiteValues.length === 0) {
      return [-1, 1];
    }

    const sorted = [...finiteValues].sort((left, right) => left - right);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const quantileLow = sorted[Math.floor((sorted.length - 1) * 0.08)];
    const quantileHigh = sorted[Math.floor((sorted.length - 1) * 0.92)];
    const rawSpan = Math.max(max - min, 1e-6);
    const trimmedSpan = Math.max(quantileHigh - quantileLow, 1e-6);
    const useTrimmed = rawSpan / trimmedSpan > 4;
    const lower = useTrimmed ? quantileLow : min;
    const upper = useTrimmed ? quantileHigh : max;
    const span = Math.max(upper - lower, 1e-6);
    const padding = Math.max(span * 0.16, 0.8);

    return [Math.min(lower - padding, -0.35), Math.max(upper + padding, 0.35)];
  }

  function buildLayout(state, datasets) {
    const yRange = computeSmartYRange(getSeriesForMode(state.mode, datasets));

    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(2, 6, 23, 0.12)',
      font: {
        color: '#e2e8f0',
        family: 'Inter, sans-serif'
      },
      margin: {
        t: 24,
        r: 18,
        b: 58,
        l: 68
      },
      showlegend: false,
      dragmode: 'pan',
      hovermode: 'x unified',
      hoverlabel: {
        bgcolor: 'rgba(15, 23, 42, 0.92)',
        bordercolor: 'rgba(125, 211, 252, 0.24)',
        font: {
          color: '#e2e8f0'
        }
      },
      xaxis: {
        title: 'x',
        range: [state.viewport.xMin, state.viewport.xMax],
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axis,
        tickcolor: 'rgba(148, 163, 184, 0.2)',
        linecolor: 'rgba(148, 163, 184, 0.24)',
        showline: true,
        mirror: false,
        showspikes: true,
        spikecolor: 'rgba(56, 189, 248, 0.32)',
        spikethickness: 1,
        spikemode: 'across'
      },
      yaxis: {
        title: MODE_LABELS[state.mode],
        range: yRange,
        gridcolor: PLOT_COLORS.grid,
        zerolinecolor: PLOT_COLORS.axis,
        tickcolor: 'rgba(148, 163, 184, 0.2)',
        linecolor: 'rgba(148, 163, 184, 0.24)',
        showline: true,
        automargin: true
      },
      shapes: [
        {
          type: 'line',
          x0: 0,
          x1: 0,
          y0: yRange[0],
          y1: yRange[1],
          line: {
            color: 'rgba(125, 211, 252, 0.18)',
            width: 1.2,
            dash: 'dot'
          }
        }
      ]
    };
  }

  function createInitialTraces(state, datasets) {
    const modeMeta = getModeMeta(state.mode);
    const yValues = getSeriesForMode(state.mode, datasets);
    const splitSeries = splitSeriesAroundZero(datasets.xValues, yValues, datasets.zeroIndex);
    const traces = [
      createLineTrace(PLOT_COLORS.glow, modeMeta.hoverLabel, 16, 0.3),
      createLineTrace(PLOT_COLORS.glow, modeMeta.hoverLabel, 16, 0.3),
      createLineTrace(modeMeta.color, modeMeta.hoverLabel, 4.5),
      createLineTrace(modeMeta.color, modeMeta.hoverLabel, 4.5)
    ];

    if (state.mode === 'function' && datasets.extrema.length > 0) {
      traces.push(createExtremumMarkers(datasets.extrema));
    }

    return {
      traces,
      splitSeries
    };
  }

  function setTraceSlice(graphElement, traceIndex, points) {
    window.Plotly.restyle(graphElement, {
      x: [points.map((point) => point.x)],
      y: [points.map((point) => point.y)]
    }, [traceIndex]);
  }

  function easeOutCubic(progress) {
    return 1 - ((1 - progress) ** 3);
  }

  function cancelAnimation(graphElement) {
    if (graphElement.__mathVisualizerAnimationFrame) {
      window.cancelAnimationFrame(graphElement.__mathVisualizerAnimationFrame);
      graphElement.__mathVisualizerAnimationFrame = null;
    }
  }

  function animateSplitTraces(graphElement, splitSeries) {
    cancelAnimation(graphElement);

    const totalFrames = Math.max(2, Math.round((ANIMATION.duration / 1000) * ANIMATION.fps));
    const leftTotal = splitSeries.left.length;
    const rightTotal = splitSeries.right.length;

    function step(frameIndex) {
      const progress = easeOutCubic(Math.min(frameIndex / totalFrames, 1));
      const leftCount = Math.max(1, Math.round(progress * leftTotal));
      const rightCount = Math.max(1, Math.round(progress * rightTotal));
      const leftPoints = splitSeries.left.slice(0, leftCount);
      const rightPoints = splitSeries.right.slice(0, rightCount);

      setTraceSlice(graphElement, 0, leftPoints);
      setTraceSlice(graphElement, 1, rightPoints);
      setTraceSlice(graphElement, 2, leftPoints);
      setTraceSlice(graphElement, 3, rightPoints);

      if (frameIndex < totalFrames) {
        graphElement.__mathVisualizerAnimationFrame = window.requestAnimationFrame(() => step(frameIndex + 1));
      }
    }

    step(1);
  }

  function renderPlot(graphElement, state, datasets) {
    const { traces, splitSeries } = createInitialTraces(state, datasets);
    const layout = buildLayout(state, datasets);
    const config = {
      responsive: true,
      displaylogo: false,
      scrollZoom: true,
      doubleClick: 'reset',
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d']
    };

    return window.Plotly.react(graphElement, traces, layout, config).then(() => {
      animateSplitTraces(graphElement, splitSeries);
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
