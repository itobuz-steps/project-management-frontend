import axios from 'axios';
import {
  handleNotification,
  urlBase64ToUint8Array,
  addNotification,
} from '../utils/browserNotification';
import { config } from '../config/config';

const api = axios.create({
  baseURL: config.API_BASE_URL + '/notification/',
});

api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    console.error(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.get(
          config.API_BASE_URL + '/auth/refresh-token',
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('refresh_token'),
            },
          }
        );

        if (response) {
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);

          originalRequest.headers['Authorization'] =
            `Bearer ${response.data.accessToken}`;

          return api(originalRequest);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export function getAllNotification(id, { page, limit }) {
  return api.get(`get/${id}?page=${page}&limit=${limit}`);
}

export async function deleteNotification(id) {
  const response = api.get(`delete/:${id}`);
  return response;
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

    api.post('subscribe', {
      email,
      subscription,
    });

    const channel = new BroadcastChannel('sw-messages');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'PUSH_NOTIFICATION') {
        handleNotification(payload, 'new');
        addNotification();
      }
    };
    return subscription;
  } catch (err) {
    console.error('Push setup failed:', err);
  }
}
