//todo:-  update the throw err.response.data to throw new Error('Message')

import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001/tasks';

class TaskService {
  api = axios.create({
    baseURL: API_BASE_URL,
  });

  constructor() {
    this.api.interceptors.request.use(
      function (config) {
        const token = localStorage.getItem('access_token');

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
      },
      function (error) {
        console.log(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const response = await this.api.get(
              '/refresh-token',
              {
                headers: {
                  Authorization:
                    'Bearer ' + localStorage.getItem('refresh_token'),
                },
              }
            );
            console.log(response);          // to be removed 

            if (response) {
              localStorage.setItem('access_token', response.data.accessToken);
              localStorage.setItem('refresh_token', response.data.refreshToken);

              originalRequest.headers[
                'Authorization'
              ] = `Bearer ${response.data.accessToken}`;

              return this.api(originalRequest);
            }
          } catch (error) {
            console.log(error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            window.location.reload();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getAllTasks() {
    try {
      const response = await this.api.get(`/`);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async getTaskById(id) {
    try {
      const response = await this.api.get(`/${id}`);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async createTask(task) {
    const formData = new FormData();

    formData.append('projectId', task.projectId);
    formData.append('title', task.title);
    formData.append('description', task.description);
    formData.append('type', task.type);
    formData.append('key', task.key);
    formData.append('status', task.status);
    formData.append('priority', task.priority);
    formData.append('tags', JSON.stringify(task.tags));
    formData.append('dueDate', task.dueDate);
    formData.append('reporter', task.reporter);
    formData.append('assignee', task.assignee);

    try {
      const response = await this.api.post(`/`, formData);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async updateTask(id, updatedTask) {
    try {
      const response = await this.api.put(`/${id}`, updatedTask);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async deleteTask(id) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }
}

const taskService = new TaskService();

export default taskService;