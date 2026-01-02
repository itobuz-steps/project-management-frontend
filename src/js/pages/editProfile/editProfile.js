import '../../../style/main.css';
import authService from '../../services/AuthService.js';
import showToast from '../../utils/showToast.js';
import { setTheme } from '../../utils/setTheme.js';

async function editProfile() {
  const form = document.getElementById('edit-profile-form');
  const profileImage = document.getElementById('profileImageAdd');
  const preview = document.getElementById('preview');
  const userEmail = document.getElementById('user-email');
  const name = document.getElementById('name');
  const userInfo = await authService.getUserInfo();
  const goBackBtn = document.getElementById('profile-go-back-btn');

  goBackBtn.addEventListener('click', () => {
    window.history.back();
  });

  if (userInfo.name) {
    name.value = userInfo.name;
  }

  if (userInfo.profileImage) {
    preview.src =
      'http://localhost:3001/uploads/profile/' + userInfo.profileImage;
  }

  userEmail.innerText = userInfo.email;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await authService.updateUserInfo(name.value, profileImage.files[0]);
      showToast('Profile Updated', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard';
      }, 1500);
    } catch (err) {
      showToast(`${err.response.data.error}`, 'danger');
    }
  });
}

setTheme(localStorage.getItem('theme') || 'indigo');
editProfile();
