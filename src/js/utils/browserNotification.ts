import { getAllNotification } from '../services/notificationService';
import type { Notification } from '../interfaces/notification';
import { DateTime } from 'luxon';
import { showTaskDrawer } from '../pages/taskDrawer/taskDrawer';
import { config } from '../config/config';

let page = 0;
const LIMIT = 10;
let isLoading = false;
let hasMore = true;
let notificationObserver: IntersectionObserver | null = null;

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function handleNotification(data: Notification, type = 'render'): void {
  const container = document.querySelector<HTMLUListElement>(
    '#notificationDropdownMenu ul'
  );

  if (!container) {
    return;
  }

  const blankElement = document.getElementById('notificationListEmpty');

  if (container.children.length === 0) {
    blankElement?.classList.remove('hidden');
  } else {
    blankElement?.classList.add('hidden');
  }

  const li = document.createElement('li');
  li.className =
    'dropdown-item notification-item flex cursor-pointer items-start px-4';

  const profileImage = data.profileImage
    ? `${config.API_BASE_URL}/uploads/profile/${data.profileImage}`
    : '../../assets/img/profile.png';

  li.innerHTML = `
    <div class="flex items-start gap-2 bg-white p-2 transition hover:bg-gray-100">
      <div class="relative shrink-0">
        <img
          src="${profileImage}"
          class="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
        />
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium text-gray-900">
          ${data.title}
        </p>
        <span class="text-xs text-gray-400">
          ${DateTime.fromISO(data.createdAt).toRelative()}
        </span>
      </div>
    </div>
  `;

  li.addEventListener('click', () => {
    if (data.taskId) {
      showTaskDrawer(data.taskId);
    }
  });

  type === 'new' ? container.prepend(li) : container.append(li);

  updateNotificationBadge();
}

export async function renderNotification(): Promise<void> {
  if (isLoading || !hasMore) return;

  isLoading = true;
  const projectId = localStorage.getItem('selectedProject');
  if (!projectId) return;

  try {
    const response = await getAllNotification(projectId, {
      page,
      limit: LIMIT,
    });

    const { result, pagination } = response;

    result.forEach((notification) =>
      handleNotification(notification, 'render')
    );

    const existingCount =
      Number(localStorage.getItem('notificationCount')) || 0;

    localStorage.setItem(
      'notificationCount',
      String(existingCount + result.length)
    );

    updateNotificationBadge();

    hasMore = pagination.hasMore;

    if (hasMore) page += 1;
    else notificationObserver?.disconnect();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading = false;
  }
}

export function lazyLoad(): void {
  const targetElement = document.getElementById('targetElement');

  const dropdownMenu = document.getElementById('notificationDropdownMenu');

  if (!targetElement || !dropdownMenu || notificationObserver) {
    return;
  }

  notificationObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        renderNotification();
      }
    },
    { root: dropdownMenu, threshold: 1 }
  );

  notificationObserver.observe(targetElement);
}

function updateNotificationBadge(): void {
  const badge = document.getElementById('notificationBadge');

  if (!badge) {
    return;
  }

  const count = Number(localStorage.getItem('notificationCount')) || 0;

  if (count > 0) {
    badge.textContent = count > 6 ? '6+' : String(count);
    badge.classList.remove('hidden');
  } else {
    badge.textContent = '';
    badge.classList.add('hidden');
  }
}

export function addNotification(): void {
  const count = (Number(localStorage.getItem('notificationCount')) || 0) + 1;

  localStorage.setItem('notificationCount', String(count));
  updateNotificationBadge();
}

function resetNotifications(): void {
  page = 0;
  hasMore = true;
  isLoading = false;

  const container = document.querySelector<HTMLUListElement>(
    '#notificationDropdownMenu ul'
  );
  container?.replaceChildren();
}

const badge = document.getElementById('notificationBadge');
const dropdownToggle = document.getElementById('dropdownToggle');

badge?.addEventListener('click', () => {
  localStorage.setItem('notificationCount', '0');
  badge.textContent = '';
  badge.classList.add('hidden');
});

dropdownToggle?.addEventListener('click', () => {
  localStorage.setItem('notificationCount', '0');
  updateNotificationBadge();

  resetNotifications();
  renderNotification();
});
