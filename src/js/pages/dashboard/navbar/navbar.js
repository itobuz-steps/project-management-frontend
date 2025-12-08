import { renderBoard } from '../dashboard';
import authService from '../../../services/AuthService';

const searchInput = document.getElementById('search-input-field');
const notificationIcon = document.querySelector('.notification-icon');
const badge = document.querySelector('.notification-badge');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const preview = document.getElementById('profileImage');

function handleSearch(e) {
  e.preventDefault();
  renderBoard(
    localStorage.getItem('selectedProject'),
    '',
    searchInput.value.trim()
  );
}

export function increaseNotificationCount() {
  const notificationCount = localStorage.getItem('notificationCount');
  localStorage.setItem('notificationCount', notificationCount + 1);

  const badge = document.querySelector('.notification-badge');
  if (!badge) return;

  badge.textContent = notificationCount;
  badge.classList.remove('hidden');
}

export async function setupNavbar() {
  const notificationCount = localStorage.getItem("notificationCount'");

  searchInput.addEventListener('input', handleSearch);

  notificationIcon.addEventListener('click', () => {
    localStorage.setItem('notificationCount', 0);

    const badge = document.querySelector('.notification-badge');

    badge.textContent = 0;
    badge.classList.add('hidden');
  });

  if (notificationCount > 0) {
    badge.textContent = notificationCount;
    badge.classList.remove('hidden');
  }

  profileBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
    }

    e.stopPropagation();
  });

  const response = await authService.getUserInfo();

  if (response.profileImage) {
    preview.src = `http://localhost:3001/uploads/profile/${response.profileImage}`;
    preview.title = response.email;
  } else {
    preview.src = '../../../../assets/img/profile.png';
  }
}
