import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001/tasks';

class TaskService {
  api = axios.create({
    baseURL: API_BASE_URL,
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
              'http://localhost:3001/auth/refresh-token',
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

  async getTaskById(id) {
    const response = await this.api.get(`/${id}`);
    return response;
  }

  async getUserDetailsById(userId) {
    const response = await this.api.get(`/user/${userId}`);
    return response;
  }

  async getTaskByProjectId(projectId, filter, searchInput) {
    const response = await this.api.get(
      `/?projectId=${projectId}&filter=${filter}&searchInput=${searchInput}`
    );

    return response;
  }

  async getMultipleUsers(userIds) {
    try {
      const response = await this.api.get(
        `/users/batch?ids=${userIds.join(',')}`
      );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch multiple users'
      );
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
    formData.append('dueDate', task.dueDate);
    formData.append('reporter', task.reporter);
    if (task.parentTask) {
      formData.append('parentTask', task.parentTask);
    }
    task.tags.forEach((tag) => {
      formData.append('tags[]', tag);
    });

    task.blocks.forEach((block) => {
      formData.append('blocks[]', block);
    });

    task.blockedBy.forEach((blocked) => {
      formData.append('blockedBy[]', blocked);
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
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  }

  async updateTask(id, updatedTask) {
    try {
      const response = await this.api.put(`/${id}`, updatedTask);

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  }

  async deleteTask(id) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  }

  async taskOfProjectId(projectId) {
    const response = await this.api.get(`/projectId/${projectId}`);
    return response;
  }
}

const taskService = new TaskService();
export default taskService;
