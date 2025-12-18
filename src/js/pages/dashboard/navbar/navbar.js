import { renderBoard } from '../dashboard.js';
import authService from '../../../services/AuthService.js';
import { renderTasksList } from '../../../utils/renderTasks.js';
import taskService from '../../../services/TaskService.js';

const searchInput = document.getElementById('search-input-field');
const notificationIcon = document.querySelector('.notification-icon');
const badge = document.querySelector('.notification-badge');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const preview = document.getElementById('profileImage');

async function handleSearch(e) {
  e.preventDefault();
  const projectId = localStorage.getItem('selectedProject');

  await renderBoard(projectId, '', searchInput.value.trim());

  await renderTasksList(projectId, '', searchInput.value.trim());
}

export async function getFilteredTasks(
  projectId,
  filter = '',
  searchInput = ''
) {
  const tasks = await taskService.getTaskByProjectId(
    projectId,
    filter,
    searchInput
  );

  return tasks.data.result;
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
  badge.classList.add('hidden');

  const notificationCount = localStorage.getItem("notificationCount'");

  searchInput.addEventListener('input', async (e) => {
    await handleSearch(e);
  });

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
