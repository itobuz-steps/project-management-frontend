import axios from 'axios';

export async function getAllNotification(id) {
  const response = axios.get(`http://localhost:3001/notification/get/${id}`);
  return response;
}

export async function markAsAllRead() {
  const response = axios.get(`http://localhost:3001/notification/read/`);
  return response;
}

export async function deleteNotification(id) {
  const response = axios.get(
    `http://localhost:3001/notification/delete/:${id}`
  );
  return response;
}
