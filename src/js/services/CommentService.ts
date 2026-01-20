import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config as appConfig } from '../config/config';

export interface CommentAuthor {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  message: string;
  author: CommentAuthor;
  attachment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCommentPayload {
  message?: string;
  attachment?: string | null;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const API_URL = `${appConfig.API_BASE_URL}/comments`;

class CommentService {
  api = axios.create({
    baseURL: API_URL,
  });

  constructor() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
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

  async getAllComments(taskId = ''): Promise<Comment[]> {
    try {
      const response = await this.api.get<Comment[]>(`/?taskId=${taskId}`);

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch comments');
    }
  }

  async createComment(formData: FormData): Promise<Comment> {
    try {
      const response = await this.api.post<Comment>('/', formData);

      return response.data;
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }

  async updateComment(
    id: string,
    updatedComment: UpdateCommentPayload
  ): Promise<Comment> {
    try {
      const response = await this.api.put<Comment>(`/${id}`, updatedComment);

      return response.data;
    } catch (error) {
      throw new Error('Failed to update comment');
    }
  }

  async deleteComment(id: string): Promise<void> {
    try {
      await this.api.delete(`/${id}`);
    } catch (error) {
      throw new Error('Failed to delete comment');
    }
  }
}

const commentService = new CommentService();
export default commentService;
