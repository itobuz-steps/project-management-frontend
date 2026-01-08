import axios from 'axios';
import { config } from '../config/config';

const API_URL = config.API_BASE_URL + '/auth';

class AuthService {
  api = axios.create({
    baseURL: API_URL,
  });

  async signup(name, email, password) {
    try {
      const response = await this.api.post(`/signup`, {
        name,
        email,
        password,
      });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async verify(email, otp) {
    try {
      const response = await this.api.post(`/verify`, { email, otp });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async login(email, password) {
    const response = await this.api.post(`/login`, { email, password });

    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);

    return response;
  }

  async sendOtp(email) {
    try {
      const response = await this.api.post(`/send-otp`, { email });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async forgetPasswordReset(email, otp, password) {
    try {
      const response = await this.api.post(`/forgot-password`, {
        email,
        otp,
        password,
      });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async updateUserInfo(name, profileImage) {
    const formData = new FormData();

    formData.append('name', name);
    formData.append('profileImage', profileImage);

    const response = await this.api.post('/user-update', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const user = response.data.result;

    return user;
  }

  async getUserInfo() {
    const response = await this.api.get('/user', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    const user = response.data.result;

    return user;
  }
}

const authService = new AuthService();

export default authService;
