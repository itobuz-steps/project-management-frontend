import axios from 'axios';
import { getAllNotification } from '../services/notificationService';
import { DateTime } from 'luxon';
import { showTaskDrawer } from '../pages/taskDrawer/taskDrawer';

let page = 0;
const LIMIT = 5;
let isLoading = false;
let hasMore = true;
let notificationObserver = null;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PUBLIC_VAPID_KEY =
  'BBxyBixxdLHGQaKCZSYguTcuFmIW9tyQQnMKOsZcQxgwjBFsHRWbSXMK2aiqQqOWkCriNtu6mDnRljyFzss8kOU';

export async function setupPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (!('PushManager' in window)) {
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register('/serviceWorker.js');

    console.log('service worker registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    console.log('subscription', subscription);

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });
    }

    const email = localStorage.getItem('userEmail');

    axios.post('http://localhost:3001/notification/subscribe', {
      email,
      subscription,
    });

    const channel = new BroadcastChannel('sw-messages');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'PUSH_NOTIFICATION') {
        handleNotification(payload);
        addNotification();
      }
    };
    return subscription;
  } catch (err) {
    console.error('Push setup failed:', err);
  }
}

function handleNotification(data) {
  console.log('title', data.title);
  console.log('data passed to notification', data);
  // console.log('userId', data.userId);
  const container = document.querySelector('#notificationDropdownMenu ul');
  if (!container) return;

  const blankElement = document.getElementById('notificationListEmpty');

  if (container.length === 0) {
    blankElement.classList.remove('hidden');
  } else {
    blankElement.classList.add('hidden');
  }

  const li = document.createElement('li');
  li.className = `
    dropdown-item notification-item flex cursor-pointer items-start px-4
  `;

  li.innerHTML = /* HTML */ `
    <div
      class="flex items-start gap-2 bg-white p-2 transition hover:bg-gray-100"
    >
      <div class="relative shrink-0">
        ${data.image
          ? `<img
            src="http://localhost:3001/uploads/profile/${data.image}"
            class="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
          />`
          : `<img
            src="../../assets/img/profile.png"
            class="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
          />`}
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-sm leading-snug font-medium text-gray-900">
          ${data.title}
        </p>

        <span class="text-xs text-gray-500">
          ${DateTime.fromISO(data.createdAt).toRelative()}
        </span>
      </div>
    </div>
  `;
  li.addEventListener('click', () => {
    showTaskDrawer(data.taskId);
  });

  if (container.length > 0) {
  }

  container.prepend(li);
  updateNotificationBadge();
}

export async function renderNotification() {
  if (isLoading || !hasMore) return;

  isLoading = true;

  const currentProject = localStorage.getItem('selectedProject');

  try {
    const res = await getAllNotification(currentProject, {
      page,
      limit: LIMIT,
    });

    const notifications = res.data.result;

    notifications.forEach(handleNotification);

    hasMore = res.data.pagination.hasMore;

    if (hasMore) {
      page++;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    isLoading = false;
  }
}

export function lazyLoad() {
  const targetElement = document.getElementById('targetElement');

  if (notificationObserver) return;

  notificationObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        renderNotification();
      }
    },
    {
      root: null,
      threshold: 0.5,
    }
  );

  notificationObserver.observe(targetElement);
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;

  const count = parseInt(localStorage.getItem('notificationCount'), 10) || 0;

  if (count > 0) {
    badge.textContent = count > 6 ? '6+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.textContent = '';
    badge.classList.add('hidden');
  }
}

function addNotification() {
  const count =
    (parseInt(localStorage.getItem('notificationCount'), 10) || 0) + 1;
  localStorage.setItem('notificationCount', count);
  updateNotificationBadge();
}

const badge = document.getElementById('notificationBadge');
const dropDownToggle = document.getElementById('dropdownToggle');
function clearNotification() {
  if (badge) {
    badge.addEventListener('click', () => {
      localStorage.setItem('notificationCount', 0);
      badge.textContent = '0';
      badge.classList.add('hidden');
    });
  }
}
badge.addEventListener('click', clearNotification);
dropDownToggle.addEventListener('click', () => {
  localStorage.setItem('notificationCount', 0);
  badge.textContent = '0';
  badge.classList.add('hidden');
});
clearNotification();

export default setupPushNotifications;
