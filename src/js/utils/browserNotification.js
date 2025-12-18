import axios from 'axios';

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
    const registration = await navigator.serviceWorker.register(
      '/serviceWorker.js'
    );
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

    return subscription;
  } catch (err) {
    console.error('Push setup failed:', err);
  }
}

export default setupPushNotifications;
