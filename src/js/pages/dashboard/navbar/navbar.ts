import authService from '../../../services/AuthService';
import taskService from '../../../services/TaskService';
import renderSelectedTab from '../../../utils/renderSelectedTab';
import { setTheme } from '../../../utils/setTheme';
import { config } from '../../../config/config';
import type { Task } from '../../../interfaces/common';

const searchInput = document.getElementById(
  'search-input-field'
) as HTMLInputElement | null;

const profileBtn = document.getElementById('profileBtn') as HTMLElement | null;
const dropdownMenu = document.getElementById(
  'dropdownMenu'
) as HTMLElement | null;
const preview = document.getElementById(
  'profileImage'
) as HTMLImageElement | null;

const themePicker = document.querySelector(
  '.theme-picker'
) as HTMLElement | null;
const themeOptions =
  themePicker?.querySelectorAll<HTMLElement>('.theme-option') ?? [];

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | undefined;

  return function (...args: Parameters<T>) {
    if (timer) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const debouncedSearch = debounce(async () => {
  await handleSearch();
}, 500);

async function handleSearch(): Promise<void> {
  const projectId = localStorage.getItem('selectedProject');
  if (!projectId || !searchInput) return;

  await renderSelectedTab(projectId, '', searchInput.value.trim());
}

export async function getFilteredTasks(
  projectId: string,
  filter: string = '',
  searchInput: string = ''
): Promise<Task[]> {
  const tasksResponse = await taskService.getTaskByProjectId(
    projectId,
    filter,
    searchInput
  );

  return tasksResponse.data.result;
}

export function increaseNotificationCount(): void {
  const count = Number(localStorage.getItem('notificationCount') ?? 0) + 1;
  localStorage.setItem('notificationCount', String(count));

  const badge = document.querySelector(
    '.notification-badge'
  ) as HTMLElement | null;

  if (!badge) return;

  badge.textContent = String(count);
  badge.classList.remove('hidden');
}

export async function setupNavbar(): Promise<void> {
  if (!searchInput || !profileBtn || !dropdownMenu) return;

  searchInput.addEventListener('input', (e: Event) => {
    e.preventDefault();
    debouncedSearch();
  });

  profileBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (
      !profileBtn.contains(e.target as Node) &&
      !dropdownMenu.contains(e.target as Node)
    ) {
      dropdownMenu.classList.add('hidden');
    }
  });

  themeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const theme = option.dataset.value;
      if (!theme) return;

      localStorage.setItem('theme', theme);
      setTheme(theme);
    });
  });

  const user = await authService.getUserInfo();

  if (preview) {
    if (user.profileImage) {
      preview.src = `${config.API_BASE_URL}/uploads/profile/${user.profileImage}`;
      preview.title = user.email;
    } else {
      preview.src = '../../../../assets/img/profile.png';
    }
  }
}

const dropdownToggle = document.getElementById(
  'dropdownToggle'
) as HTMLElement | null;

const notificationDropdownMenu = document.getElementById(
  'notificationDropdownMenu'
) as HTMLElement | null;

function toggleDropdown(): void {
  if (!notificationDropdownMenu) return;
  notificationDropdownMenu.classList.toggle('hidden');
  notificationDropdownMenu.classList.toggle('block');
}

function hideDropdown(): void {
  if (!notificationDropdownMenu) return;
  notificationDropdownMenu.classList.add('hidden');
  notificationDropdownMenu.classList.remove('block');
}

dropdownToggle?.addEventListener('click', (event: MouseEvent) => {
  event.stopPropagation();
  toggleDropdown();
});

notificationDropdownMenu
  ?.querySelectorAll<HTMLElement>('.dropdown-item')
  .forEach((li) => {
    li.addEventListener('click', () => {
      hideDropdown();
    });
  });

document.addEventListener('click', (event: MouseEvent) => {
  if (
    notificationDropdownMenu &&
    !notificationDropdownMenu.contains(event.target as Node) &&
    event.target !== dropdownToggle
  ) {
    hideDropdown();
  }
});
