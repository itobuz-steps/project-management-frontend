import authService from '../services/AuthService.js';

export async function profileNameIcon(profileName) {
  const response = await authService.getUserInfo();

  if (response.name) {
    const name = response.name.split('')[0];
    profileName.textContent = name.toUpperCase();
  }
}
