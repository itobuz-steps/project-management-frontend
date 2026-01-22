import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import type {
  GetNotificationParams,
  NotificationResponse,
} from '../interfaces/notification';
import type { RefreshTokenResponse } from '../interfaces/common';
import {
  handleNotification,
  urlBase64ToUint8Array,
  addNotification,
} from '../utils/browserNotification';

import { config as appConfig } from '../config/config';

const api: AxiosInstance = axios.create({
  baseURL: `${appConfig.API_BASE_URL}/notification/`,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.get<RefreshTokenResponse>(
          `${appConfig.API_BASE_URL}/auth/refresh-token`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

export async function getAllNotification(
  id: string,
  params: GetNotificationParams
): Promise<NotificationResponse> {
  const { page, limit } = params;

  const response = await api.get<NotificationResponse>(
    `get/${id}?page=${page}&limit=${limit}`
  );

  return response.data;
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await api.delete(`/${notificationId}`);
}

const PUBLIC_VAPID_KEY =
  'BBxyBixxdLHGQaKCZSYguTcuFmIW9tyQQnMKOsZcQxgwjBFsHRWbSXMK2aiqQqOWkCriNtu6mDnRljyFzss8kOU';

export async function setupPushNotifications(): Promise<PushSubscription | void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration =
      await navigator.serviceWorker.register('/serviceWorker.js');

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          PUBLIC_VAPID_KEY
        ) as BufferSource,
      });
    }

    const email = localStorage.getItem('userEmail');

    if (!email) {
      return;
    }

    await api.post('/subscribe', {
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
