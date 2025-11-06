import '../../../scss/main.css';

document
  .getElementById('dropdownButtonForSprint')
  .addEventListener('click', function () {
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle('hidden');
  });