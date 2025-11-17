import '../../../scss/main.css';

const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('CloseButton');
const modal = document.getElementById('task-modal');
const input = document.getElementById('attachments');
const fileName = document.getElementById('file-name');

input.addEventListener('change', () => {
  if (input.files.length > 0) {
    fileName.textContent = Array.from(input.files)
      .map((file) => file.name)
      .join(', ');
  } else {
    fileName.textContent = 'No Files Chosen';
  }
});

toggleButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
closeButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
