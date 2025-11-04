import * as bootstrap from 'bootstrap';

const messageDiv = document.getElementById('message');

function showMessage(text, type = 'info') {
  messageDiv.textContent = text;
  if (type === 'danger') {
    messageDiv.style.color = 'red';
  } else if (type === 'info') {
    messageDiv.style.color = 'blue';
  } else if (type === 'success') {
    messageDiv.style.color = 'MediumSpringGreen';
  } else if (type === 'warning') {
    messageDiv.style.color = 'crimson';
  }
}

/**
 * @param {string} message
 * @param {string} type
 * @param {number} delay
 */
function showToast(message, type = 'info', delay = 2000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    return;
  }

  const bgClass =
    type === 'success'
      ? 'bg-success text-white'
      : type === 'error'
      ? 'bg-danger text-white'
      : 'bg-info text-white';

  const toastEl = document.createElement('div');

  toastEl.className = `toast align-items-center ${bgClass} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay });
  toast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

export { showToast, showMessage };
