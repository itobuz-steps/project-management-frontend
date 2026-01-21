import axios, { AxiosError, type AxiosResponse } from 'axios';
import { config } from '../config/config';
import type { Task } from '../interfaces/common';
import type { User } from '../interfaces/auth';

const API_URL = config.API_BASE_URL + '/tasks';

class TaskService {
  api = axios.create({
    baseURL: API_URL,
  });

  constructor() {
    // Attach token
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

    // Refresh token logic
    this.api.interceptors.response.use(
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
                  Authorization:
                    'Bearer ' + localStorage.getItem('refresh_token'),
                },
              }
            );

            if (response) {
              localStorage.setItem('access_token', response.data.accessToken);
              localStorage.setItem('refresh_token', response.data.refreshToken);

              originalRequest.headers['Authorization'] =
                `Bearer ${response.data.accessToken}`;

              return this.api(originalRequest);
            }
          } catch (err) {
            console.log(err);
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
    const response = await this.api.get(`/`);
    return response;
  }

  async getAllUserTasks() {
    const response = await this.api.get(`/me`);
    return response;
  }

  async getTaskById(id: string): Promise<AxiosResponse<{ result: Task }>> {
    const response = await this.api.get(`/${id}`);
    return response;
  }

  async getUserDetailsById(userId: string) {
    const response = await this.api.get(`/user/${userId}`);
    return response;
  }

  async getTaskByProjectId(
    projectId: string,
    filter: string | null = '',
    searchInput: string | null = ''
  ) {
    const response = await this.api.get(
      `/?projectId=${projectId}&filter=${filter}&searchInput=${searchInput}`
    );

    return response;
  }

  async getMultipleUsers(userIds: string[]): Promise<{ result: User[] }> {
    try {
      const response = await this.api.get(
        `/users/batch?ids=${userIds.join(',')}`
      );

      return response.data;
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        throw error;
      }

      throw new Error(
        error.response?.data?.message || 'Failed to fetch multiple users'
      );
    }
  }

  async createTask(task: Task) {
    const formData = new FormData();

    if (task.key) {
      formData.append('key', task.key);
    }

    if (task.reporter) {
      formData.append('reporter', task.reporter);
    }

    formData.append('projectId', task.projectId);
    formData.append('title', task.title);
    formData.append('storyPoint', task.storyPoint.toString());
    formData.append('description', task.description);
    formData.append('type', task.type);
    formData.append('status', task.status);
    formData.append('priority', task.priority);
    formData.append('dueDate', task.dueDate);

    if (task.parentTask) {
      formData.append('parentTask', task.parentTask);
    }
    task.tags.forEach((tag: string) => {
      formData.append('tags[]', tag);
    });

    if (task.assignee) {
      formData.append('assignee', task.assignee);
    }

    if (task.attachments) {
      Array.from(task.attachments).forEach((file) => {
        formData.append('attachments', file);
      });
    }

    try {
      const response = await this.api.post(`/`, formData);

      return response;
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        return;
      }

      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  async updateTask(id: string, updatedTask: Partial<Task>) {
    try {
      const response = await this.api.put(`/${id}`, updatedTask);

      return response;
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        return;
      }

      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }

  async deleteTask(id: string) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response;
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        return;
      }

      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  }

  async taskOfProjectId(projectId: string) {
    const response = await this.api.get(`/projectId/${projectId}`);
    return response;
  }
}

const taskService = new TaskService();
export default taskService;
