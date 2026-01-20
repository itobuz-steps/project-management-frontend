export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  name: string;
  projectType: string;
  columns: string[];
}
