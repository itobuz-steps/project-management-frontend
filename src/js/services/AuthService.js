import axios from "axios";
const API_BASE_URL = "http://localhost:3001/auth";

class AuthService {
  api = axios.create({
    baseURL: API_BASE_URL,
  });

  async signup(name, email, password) {
    try {

      const response = await this.api.post(`/signup`, { name, email, password });

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
    try {

      const response = await this.api.post(`/login`, { email, password });

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async sendOtp(email) {
    try {

      const response = await this.api.post(`/send-otp`, { email });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }

  async forgetPasswordReset(email, otp, newPassword) {
    try {
      const response = await this.api.post(`/forgot-password`, { email, otp, newPassword });

      return response;
    } catch (error) {
      throw error.response.data;
    }
  }
}

const authService = new AuthService();

export default authService;