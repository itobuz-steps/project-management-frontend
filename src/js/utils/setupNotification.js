import { io } from 'socket.io-client';

export function setupSocketIo(callback) {
  const socket = io('http://localhost:3001/', {
    auth: { token: localStorage.getItem('access_token') },
  });

  socket.on('connect', () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on('notification', (message) => callback(message));
}
