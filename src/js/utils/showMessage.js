const messageDiv = document.getElementById('message');

export function showMessage(text, type = 'info') {
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
