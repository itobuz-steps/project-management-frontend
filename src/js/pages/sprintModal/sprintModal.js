import '../../../scss/main.css';

const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('closeButton');
const modal = document.getElementById('sprint-modal');
// const form = document.getElementById('sprint-form');

toggleButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});

closeButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});


