import '../../../scss/main.css';
import authService from '../../services/AuthService.js';
import { profileNameIcon } from '../../utils/profileIcon.js';

async function profileIcon() {
  const preview = document.getElementById('profileImage');
  const profileName = document.querySelector('.profile-image');
  const response = await authService.getUserInfo();

  if (response.profileImage) {
    preview.src = `http://localhost:3001/uploads/profile/${response.profileImage}`;
    preview.title = response.email;
  } else {
    profileNameIcon(profileName);
  }
}

profileIcon();
