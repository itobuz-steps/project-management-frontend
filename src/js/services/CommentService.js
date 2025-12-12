import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/comments';

class CommentService {
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

              originalRequest.headers[
                'Authorization'
              ] = `Bearer ${response.data.accessToken}`;

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

  async getAllComments(taskId = '') {
    try {
      const response = await this.api.get(`/?taskId=${taskId}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch comments'
      );
    }
  }

  async createComment(formData) {
    try {
      const response = await this.api.post(`/`, formData);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create comment'
      );
    }
  }

  async updateComment(id, updatedComment) {
    try {
      const response = await this.api.put(`/${id}`, updatedComment);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update comment'
      );
    }
  }

  async deleteComment(id) {
    try {
      const response = await this.api.delete(`/${id}`);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete comment'
      );
    }
  }
}

const commentService = new CommentService();
export default commentService;
