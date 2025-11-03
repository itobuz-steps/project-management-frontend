const messageDiv = document.getElementById('message');

export function showMessage(text, type = 'info') {
  messageDiv.textContent = text;
  if (type === 'danger') {
    messageDiv.style.color = 'red';
  } else if (type === 'info') {
    messageDiv.style.color = 'LightCyan';
  } else if (type === 'success') {
    messageDiv.style.color = 'MediumSpringGreen';
  }

  setTimeout(() => {
    messageDiv.textContent = '';
  }, 2000);
}
