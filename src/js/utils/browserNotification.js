import axios from 'axios';
import { getAllNotification } from '../services/notificationService';
import { DateTime } from 'luxon';

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
    console.error('Service Worker not supported');
    return;
  } else {
    console.log('Service worker supported');
  }

  if (!('PushManager' in window)) {
    console.error('PushManager not supported');
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register('/serviceWorker.js');
    console.log('Service Worker registered');

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
      console.log('New subscription created');
    } else {
      console.log('Existing subscription found');
    }

    const email = localStorage.getItem('userEmail');

    axios.post('http://localhost:3001/notification/subscribe', {
      email,
      subscription,
    });

    console.log('Subscription sent to backend');

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
    transition-colors duration-200
    hover:bg-gray-50
    ${isUnread ? 'bg-blue-50/40' : ''}
  `;

  li.innerHTML = /*html*/ `
    <div class="relative">
      ${
        data.avatar
          ? `<img src="${data.avatar}" class="h-10 w-10 rounded-full object-cover" />`
          : `
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
          `
      }

      ${
        isUnread
          ? `<span class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-600"></span>`
          : ''
      }
    </div>
    <div class="flex flex-1 flex-col gap-1">
      <h4 class="text-sm font-semibold text-slate-900 leading-snug">
        ${data.title || 'Notification'}
      </h4>}
      <span class="mt-1 text-xs font-medium text-blue-600">
        ${DateTime.fromISO(data.createdAt).toRelative() || 'Just now'}
      </span>
    </div>
  `;

  container.prepend(li);
}

export async function renderNotification() {
  const currentProject = localStorage.getItem('selectedProject');

  const notifications = (await getAllNotification(currentProject)).data.result;

  console.log(notifications);

  for (const notification of notifications) {
    handleNotification(notification);
  }
}


export default setupPushNotifications;
