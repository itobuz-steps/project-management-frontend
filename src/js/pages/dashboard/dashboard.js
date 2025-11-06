import '../../../scss/main.css';

document
  .getElementById('dropdownButtonForSprint')
  .addEventListener('click', function () {
    const dropdownMenu = document.querySelector('.dropdown-menu-sprint');
    dropdownMenu.classList.toggle('hidden');
  });

document
  .getElementById('dropdownButtonForBacklog')
  .addEventListener('click', function () {
    const dropdownMenu = document.querySelector('.dropdown-menu-backlog');
    dropdownMenu.classList.toggle('hidden');
  });