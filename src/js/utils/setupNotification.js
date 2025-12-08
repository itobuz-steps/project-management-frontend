import { io } from 'socket.io-client';
import { increaseNotificationCount } from '../pages/dashboard/navbar/navbar';

export function setupSocketIo(callback) {
  const socket = io('http://localhost:3001/', {
    auth: { token: localStorage.getItem('access_token') },
  });

  socket.on('connect', () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on('notification', (message) => callback(message));
}

export function showNotification(message) {
  const notification = document.querySelector('.notification');
  const messageEl = notification.querySelector('.message');
  const dismissButton = notification.querySelector('.dismiss');

  messageEl.textContent = message;
  notification.classList.remove('hidden');
  increaseNotificationCount();

  dismissButton.addEventListener('click', () => {
    notification.classList.add('hidden');
  });

  setTimeout(() => notification.classList.add('hidden'), 5000);
}

export function setupNotification() {
  setupSocketIo(showNotification);
}
