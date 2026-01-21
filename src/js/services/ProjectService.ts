import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config as appConfig } from '../config/config';
import type { ApiResponse, RefreshTokenResponse } from '../interfaces/common';
import type { Project } from '../interfaces/common';
import type { ProjectMember } from '../interfaces/common';

const API_URL = `${appConfig.API_BASE_URL}/project`;

class ProjectService {
  api = axios.create({
    baseURL: API_URL,
  });

  constructor() {
    this.api.interceptors.request.use(
      function (config: InternalAxiosRequestConfig) {
        const token = localStorage.getItem('access_token');

        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | (InternalAxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.get<RefreshTokenResponse>(
              `${appConfig.API_BASE_URL}/auth/refresh-token`,
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              }
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);

            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

            return this.api(originalRequest);
          } catch (err) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.reload();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getAllProjects<T = unknown>(): Promise<T> {
    try {
      const response = await this.api.get<T>('/');

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch projects');
    }
  }

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.api.get<ApiResponse<Project>>(`/${id}`);

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch project');
    }
  }

  async createProject(project: Project): Promise<ApiResponse<Project>> {
    try {
      const response = await this.api.post<ApiResponse<Project>>(`/`, project);

      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create project');
    }
  }

  async updateProject(
    id: string,
    updatedProject: Partial<Project>
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await this.api.put<ApiResponse<Project>>(
        `/${id}`,
        updatedProject
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to update project');
    }
  }

  async deleteProject<T = void>(id: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(`/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to delete project');
    }
  }

  async getProjectMembers(
    projectId: string
  ): Promise<ApiResponse<ProjectMember[]>> {
    try {
      const response = await this.api.get<ApiResponse<ProjectMember[]>>(
        `/get-user/${projectId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch project members');
    }
  }

  async getProjectsByUserId<T = unknown>(): Promise<T> {
    try {
      const response = await this.api.get<T>('/user-projects');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch user projects');
    }
  }

  private handleError(error: unknown, fallbackMessage: string): Error {
    if (axios.isAxiosError(error)) {
      return new Error(
        (error.response?.data as { message?: string })?.message ||
          fallbackMessage
      );
    }
    return new Error(fallbackMessage);
  }
}

const projectService = new ProjectService();
export default projectService;
