window.MathVisualizer = window.MathVisualizer || {};

(() => {
  const { FIXED_FUNCTION, MODE_LABELS } = window.MathVisualizer.config;

  function getElements() {
    return {
      graph: document.getElementById('graph'),
      modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
      messageBox: document.getElementById('message-box'),
      chartCaption: document.getElementById('chart-caption')
    };
  }

  function renderActiveMode(elements, mode) {
    elements.modeButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });

    elements.chartCaption.textContent = `Показан график ${MODE_LABELS[mode]}.`;
  }

  function renderMessage(elements, text, type) {
    elements.messageBox.textContent = text;
    elements.messageBox.className = type ? `message-box ${type}` : 'message-box';
  }

  function renderInitialMessage(elements) {
    renderMessage(elements, `Функция зафиксирована: ${FIXED_FUNCTION}. Нажмите одну из трёх кнопок для переключения графика.`, 'success');
  }

  window.MathVisualizer.ui = {
    getElements,
    renderActiveMode,
    renderMessage,
    renderInitialMessage
  };
})();
