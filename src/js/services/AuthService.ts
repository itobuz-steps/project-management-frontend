import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config/config';

interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

const API_URL = `${config.API_BASE_URL}/auth`;

class AuthService {
  api = axios.create({
    baseURL: API_URL,
  });

  async signup(payload: SignupPayload) {
    try {
      const response = await this.api.post('/signup', payload);

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verify(email: string, otp: string) {
    try {
      const response = await this.api.post('/verify', { email, otp });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(email: string, password: string) {
    const response = await this.api.post<LoginResponse>('/login', {
      email,
      password,
    });

    const { accessToken, refreshToken } = response.data;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    return response;
  }

  async sendOtp(email: string) {
    try {
      const response = await this.api.post('/send-otp', { email });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgetPasswordReset(email: string, otp: string, password: string) {
    try {
      const response = await this.api.post('/forgot-password', {
        email,
        otp,
        password,
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserInfo(name: string, profileImage: File): Promise<User> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Unauthorized');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('profileImage', profileImage);

    const response = await this.api.post('/user-update', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.result as User;
  }

  async getUserInfo(): Promise<User> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Unauthorized');
    }

    const response = await this.api.get('/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.result as User;
  }

  handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data ?? error.message;
    }
    return 'Unexpected error occurred';
  }
}

const authService = new AuthService();
export default authService;
