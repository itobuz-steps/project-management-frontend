import { AxiosError } from 'axios';
import authService from '../../services/AuthService';
import { setTheme } from '../../utils/setTheme';
import showToast from '../../utils/showToast';

const otpInput = document.getElementById(
  'otp-input'
) as HTMLInputElement | null;
const verifyForm = document.querySelector<HTMLFormElement>('.verify-form');
const resendLink = document.querySelector<HTMLAnchorElement>('.resend');
const verifyButton =
  document.querySelector<HTMLButtonElement>('.verify-button');

setTheme(localStorage.getItem('theme') || 'indigo');

async function handleOtpVerification(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  if (!otpInput || !verifyButton) {
    return;
  }

  const otp = otpInput.value.trim();
  const email = localStorage.getItem('pendingEmail');

  if (!email) {
    showToast('Email not found. Please try registering again.', 'info');
    window.location.href = 'signup';
    return;
  }

  const originalText = verifyButton.textContent ?? '';

  verifyButton.textContent = 'Verifying...';
  verifyButton.disabled = true;

  try {
    await authService.verify(email, otp);

    localStorage.removeItem('pendingEmail');

    showToast('OTP verified successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'signup';
    }, 1000);
  } catch (error) {
    if (!(error instanceof AxiosError)) {
      return;
    }
    
    showToast(
      error?.message || 'OTP verification failed. Please try again.',
      'error'
    );
  } finally {
    verifyButton.textContent = originalText;
    verifyButton.disabled = false;
  }
}

async function handleResendOtp(): Promise<void> {

  if (!resendLink) {
    return;
  }

  const email = localStorage.getItem('pendingEmail');

  if (!email) {
    showToast('Email not found. Please try registering again.', 'info');
    window.location.href = 'signup.html';
    return;
  }

  resendLink.style.pointerEvents = 'none';

  try {
    await authService.sendOtp(email);
    showToast('OTP has been resent to your email.', 'success');
  } catch (error) {
    if (!(error instanceof AxiosError)) {
      return;
    }

    showToast(
      error?.message ?? 'Failed to resend OTP. Please try again.',
      'error'
    );
  } finally {
    resendLink.style.pointerEvents = 'auto';
  }
}

verifyForm?.addEventListener('submit', handleOtpVerification);

resendLink?.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  handleResendOtp();
});
