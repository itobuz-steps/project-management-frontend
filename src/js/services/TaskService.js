import axios from 'axios';
import { showNotification } from '../pages/dashboard/dashboard';
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
            const response = await axios.get(
              'http://localhost:3001/auth/refresh-token',
              {
                headers: {
                  Authorization:
                    'Bearer ' + localStorage.getItem('refresh_token'),
                },
              }
            );
            console.log(response); // to be removed

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
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }

  async getTaskById(id) {
    console.log(`task id ${id}`);
    try {
      const response = await this.api.get(`/${id}`);

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }

  async getUserDetailsById(userId) {
    try {
      const response = await this.api.get(`/user/${userId}`);

      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch user details'
      );
    }
  }

  async getTaskByProjectId(projectId, filter, searchInput) {
    try {
      const response = await this.api.get(
        `/?projectId=${projectId}&filter=${filter}&searchInput=${searchInput}`
      );

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
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

    if (task.assignee) {
      formData.append('assignee', task.assignee);
    } // change the service logic    }
    task.block.forEach((blockingTask) => {
      formData.append('block[]', blockingTask);
    });
    task.block.forEach((blockedTask) => {
      formData.append('blockedBy[]', blockedTask);
    });
    task.block.forEach((relatedTask) => {
      formData.append('relatesTo[]', relatedTask);
    });

    try {
      const response = await this.api.post(`/`, formData);
      const email = response.data?.user?.email;

      showNotification(`Task created by ${email}!`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  async updateTask(id, updatedTask) {
    try {
      const response = await this.api.put(`/${id}`, updatedTask);
      // showNotification('Task Updated by ');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }

  async deleteTask(id) {
    try {
      const response = await this.api.delete(`/${id}`);
      const email = response.data?.user?.email;

      showNotification(`Task deleted by ${email}!`);

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  }
}

const taskService = new TaskService();

export default taskService;
