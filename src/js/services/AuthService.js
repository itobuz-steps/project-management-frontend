//todo:-  update the throw err.response.data to throw new Error('Message')

import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001/auth';

class AuthService {
  api = axios.create({
    baseURL: API_BASE_URL,
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

  async getUserDetailsById(userId) {
    try {
      const response = await this.api.get(`/${userId}`);

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
    console.log(response);
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
}

const authService = new AuthService();

export default authService;
