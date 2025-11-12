import '../../../scss/main.css';

const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('CloseButton');
const modal = document.getElementById('authentication-modal');

toggleButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
closeButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
