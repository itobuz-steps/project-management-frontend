import '../../../style/main.css';
import authService from '../../services/AuthService';
import showToast from '../../utils/showToast';
import { setTheme } from '../../utils/setTheme';
import { config } from '../../config/config';
import type { User } from '../../interfaces/auth';

async function editProfile(): Promise<void> {
  const form = document.getElementById(
    'edit-profile-form'
  ) as HTMLFormElement | null;
  const profileImage = document.getElementById(
    'profileImageAdd'
  ) as HTMLInputElement | null;
  const preview = document.getElementById('preview') as HTMLImageElement | null;
  const userEmail = document.getElementById('user-email') as HTMLElement | null;
  const nameInput = document.getElementById('name') as HTMLInputElement | null;
  const goBackBtn = document.getElementById(
    'profile-go-back-btn'
  ) as HTMLButtonElement | null;

  if (
    !form ||
    !profileImage ||
    !preview ||
    !userEmail ||
    !nameInput ||
    !goBackBtn
  ) {
    console.error('Edit profile: missing required DOM elements');
    return;
  }

  const userInfo: User = await authService.getUserInfo();

  goBackBtn.addEventListener('click', () => {
    window.history.back();
  });

  if (userInfo.name) {
    nameInput.value = userInfo.name;
  }

  if (userInfo.profileImage) {
    preview.src = `${config.API_BASE_URL}/uploads/profile/${userInfo.profileImage}`;
  }

  userEmail.innerText = userInfo.email;

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      const file: File | undefined = profileImage.files?.[0];

      await authService.updateUserInfo(nameInput.value, file);
      showToast('Profile Updated', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard';
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : ((err as any)?.response?.data?.error ?? 'Something went wrong');

      showToast(errorMessage);
    }
  });
}

setTheme((localStorage.getItem('theme') as string) || 'indigo');
editProfile();
