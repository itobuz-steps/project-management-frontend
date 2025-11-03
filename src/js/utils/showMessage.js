const messageDiv = document.getElementById('message');

export function showMessage(text, type = 'danger') {
  messageDiv.textContent = text;
  if (type === 'danger') {
    messageDiv.style.color = 'red';
  } else if (type === 'info') {
    messageDiv.style.color = '';
  }
}
