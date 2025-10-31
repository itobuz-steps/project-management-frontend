const messageDiv = document.getElementById('message');

export function showMessage(text, type = 'info') {
  messageDiv.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`;
}
