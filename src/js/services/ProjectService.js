import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/project';

class ProjectService {
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

  async getAllProjects() {
    try {
      const response = await this.api.get(`/`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch projects'
      );
    }
  }

  async getProjectById(id) {
    try {
      const response = await this.api.get(`/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch project'
      );
    }
  }

  async createProject(project) {
    try {
      const response = await this.api.post(`/`, project);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create project'
      );
    }
  }

  async updateProject(id, updatedProject) {
    try {
      const response = await this.api.put(`/${id}`, updatedProject);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update project'
      );
    }
  }

  async deleteProject(id) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete project'
      );
    }
  }

  async getProjectMembers(projectId) {
    try {
      const response = await this.api.get(`/get-user/${projectId}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch project members'
      );
    }
  }

  async getProjectsByUserId() {
    try {
      const response = await this.api.get('/user-projects');

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch user projects'
      );
    }
  }
}

const projectService = new ProjectService();
export default projectService;
