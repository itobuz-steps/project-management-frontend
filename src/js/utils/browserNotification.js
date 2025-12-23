import axios from 'axios';
import { getAllNotification } from '../services/notificationService';
import { DateTime } from 'luxon';

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

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

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
      }
    };
    return subscription;
  } catch (err) {
    console.error('Push setup failed:', err);
  }
}

function handleNotification(data) {
  const container = document.querySelector('#notificationDropdownMenu ul');
  if (!container) return;

  const li = document.createElement('li');
  const isUnread = data.unread ?? true;

  li.className = `
    dropdown-item flex cursor-pointer items-start gap-4 p-4
    hover:bg-gray-50
    ${isUnread ? 'bg-blue-50/40' : ''}
  `;

  li.innerHTML = `
    <div class="relative">
      ${
        data.avatar
          ? `<img src="${data.avatar}" class="h-10 w-10 rounded-full" />`
          : `<div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">🔔</div>`
      }
      ${isUnread ? `<span class="absolute -top-1 -right-1 h-2 w-2 bg-blue-600 rounded-full"></span>` : ''}
    </div>
    <div class="flex flex-col">
      <p class="text-sm font-semibold">${data.title}</p>
      <span class="text-xs text-blue-600">
        ${DateTime.fromISO(data.createdAt).toRelative()}
      </span>
    </div>
  `;

  container.insertBefore(li, document.getElementById('targetElement'));
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

    console.table(notifications);

    notifications.forEach(handleNotification);

    hasMore = res.data.pagination.hasMore;
    if (hasMore) page++;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    isLoading = false;
  }
}

export function lazyLoad() {
  const targetElement = document.getElementById('targetElement');
  const rootEl = document.getElementById('notificationDropdownMenu');

  if (notificationObserver) return;

  notificationObserver = new IntersectionObserver(
    (entries) => {
      console.log(entries);
      if (entries[0].isIntersecting) {
        console.log('Intersecting');
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

export default setupPushNotifications;
