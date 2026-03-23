window.MathVisualizer = window.MathVisualizer || {};

(() => {
  function getElements() {
    return {
      graph: document.getElementById('graph'),
      modeButtons: Array.from(document.querySelectorAll('[data-mode]'))
    };
  }

  function renderActiveMode(elements, mode) {
    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode
  };
})();
