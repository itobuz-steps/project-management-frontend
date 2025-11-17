import '../../../scss/main.css';
import authService from '../../services/AuthService.js';

async function profileIcon() {
  const preview = document.getElementById('profileImage');
  const profileName = document.querySelector('.profile-image');
  const response = await authService.getUserInfo();

  if (response.profileImage) {
    preview.src = `http://localhost:3001/uploads/profile/${response.profileImage}`;
  } else if (response.name) {
    const name = response.name.split('')[0];
    profileName.textContent = name.toUpperCase();
  }
}

// profileIcon();
