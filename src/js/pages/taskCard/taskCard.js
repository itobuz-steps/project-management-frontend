import '../../../scss/main.css';

const menuButton = document.getElementById('menuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const typeTag = document.getElementById('typeTag');
const typeSelector = document.getElementById('typeSelector');

menuButton.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
});

document.getElementById('editBtn').addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
});
document.getElementById('deleteBtn').addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
});
document.getElementById('moveBtn').addEventListener('click', () => {
  dropdownMenu.classList.add('hidden');
});

typeSelector.addEventListener('change', (e) => {
  const value = e.target.value;

  if (value === 'task') {
    typeTag.className =
      'bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
    typeTag.textContent = 'TASK';
  } else {
    typeTag.className =
      'bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
    typeTag.textContent = 'STORY';
  }
});
