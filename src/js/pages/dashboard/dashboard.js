import '../../../scss/main.css';

const dropdownButtonSprint = document.getElementById('dropdownButtonForSprint');
dropdownButtonSprint.addEventListener('click', function () {
  const dropdownMenu = document.querySelector('.dropdown-menu-sprint');
  dropdownMenu.classList.toggle('hidden');
});

const dropdownButtonBacklog = document.getElementById('dropdownButtonForBacklog');
dropdownButtonBacklog.addEventListener('click', function () {
  const dropdownMenu = document.querySelector('.dropdown-menu-backlog');
  dropdownMenu.classList.toggle('hidden');
});

const dropdownIconSprint = document.getElementById('dropdown-icon-sprint');
dropdownButtonSprint.addEventListener('click', function () {
  if (dropdownIconSprint.classList.contains('rotate-270')) {
    dropdownIconSprint.classList.remove('rotate-270');
  } else {
    dropdownIconSprint.classList.add('rotate-270');
  }
});

const dropdownIconBacklog = document.getElementById('dropdown-icon-backlog');
dropdownButtonBacklog.addEventListener('click', function () {
  if (dropdownIconBacklog.classList.contains('rotate-270')) {
    dropdownIconBacklog.classList.remove('rotate-270');
  } else {
    dropdownIconBacklog.classList.add('rotate-270');
  }
});
