import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/sprint';

class SprintService {
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
        console.error(error);
      }
    );

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
            console.error(err);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.reload();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getAllSprints(projectId = '') {
    try {
      const response = await this.api.get(`/?projectId=${projectId}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch sprints'
      );
    }
  }

  async getSprintById(id) {
    try {
      const response = await this.api.get(`/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch sprint'
      );
    }
  }

  async createSprint(sprint) {
    try {
      const response = await this.api.post(`/`, sprint);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create sprint'
      );
    }
  }

  async updateSprint(id, updatedSprint) {
    try {
      const response = await this.api.put(`/${id}`, updatedSprint);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update sprint'
      );
    }
  }

  async addTasksToSprint(id, updatedSprint) {
    try {
      const response = await this.api.patch(`/${id}/addTasks`, updatedSprint);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update sprint'
      );
    }
  }

  async removeTaskFromSprint(sprintId, taskId) {
    try {
      const response = await this.api.patch(`/${sprintId}/removeTasks`, taskId);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update sprint'
      );
    }
  }

  async deleteSprint(id) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete sprint'
      );
    }
  }
}

const sprintService = new SprintService();
export default sprintService;
