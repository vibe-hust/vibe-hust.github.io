(() => {
  const magnification = 2.5;

  // All three methods crop the same rectangle in original-frame coordinates.
  function cropOffset(center) {
    const extent = 1 / magnification;
    const start = Math.max(0, Math.min(center - extent / 2, 1 - extent));
    return -100 * start + '%';
  }

  for (const matrix of document.querySelectorAll('.frame-matrix')) {
    matrix.style.setProperty('--magnification', magnification);
    for (const heading of matrix.querySelectorAll('thead [data-frame]')) {
      const column = matrix.querySelectorAll('button[data-frame="' + heading.dataset.frame + '"]');
      const frameLabel = heading.textContent;
      function showDetail(enabled, x = .5, y = .5) {
        heading.toggleAttribute('data-zoomed', enabled);
        heading.textContent = enabled ? frameLabel + ' · ' + magnification + '×' : frameLabel;
        for (const button of column) {
          button.style.setProperty('--crop-x', cropOffset(x));
          button.style.setProperty('--crop-y', cropOffset(y));
          button.setAttribute('aria-pressed', String(enabled));
        }
      }
      for (const button of column) {
        button.addEventListener('click', event => {
          let x = Number(heading.dataset.focusX);
          let y = Number(heading.dataset.focusY);
          if (event.detail > 0 && matrix.dataset.zoomTarget !== 'subject') {
            const bounds = button.getBoundingClientRect();
            x = (event.clientX - bounds.left) / bounds.width;
            y = (event.clientY - bounds.top) / bounds.height;
          }
          showDetail(!heading.hasAttribute('data-zoomed'), x, y);
        });
        button.addEventListener('keydown', event => {
          if (event.key === 'Escape' && heading.hasAttribute('data-zoomed')) {
            showDetail(false);
          }
        });
      }
    }
  }
})();
