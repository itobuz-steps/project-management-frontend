import axios from 'axios';

export function getAllNotification(id, { page, limit }) {
  return axios.get(
    `http://localhost:3001/notification/get/${id}?page=${page}&limit=${limit}`
  );
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
