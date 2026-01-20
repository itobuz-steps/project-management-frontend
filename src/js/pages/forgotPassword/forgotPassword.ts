import authService from '../../services/AuthService';
import showToast from '../../utils/showToast';
import { setTheme } from '../../utils/setTheme';

const forgotForm = document.querySelector<HTMLFormElement>('.forgot-form');
const emailInput = document.getElementById('email-input') as HTMLInputElement | null;
const otpInput = document.getElementById('otp-input') as HTMLInputElement | null;
const passwordInput = document.getElementById('password-input') as HTMLInputElement | null;

if (!forgotForm || !emailInput || !otpInput || !passwordInput) {
  throw new Error('Required form elements not found');
}

const sendOtpButton = forgotForm.querySelector<HTMLButtonElement>('.send');
const resetButton = forgotForm.querySelector<HTMLButtonElement>('.reset-button');

if (!sendOtpButton || !resetButton) {
  throw new Error('Action buttons not found');
}

let isOtpSent = false;
let isOtpVerified = false;

otpInput.disabled = true;
passwordInput.disabled = true;

setTheme(localStorage.getItem('theme') || 'indigo');

sendOtpButton.addEventListener('click', async (e: MouseEvent) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showToast('Enter email.', 'info');
    return;
  }

  emailInput.disabled = true;
  sendOtpButton.textContent = 'Sending...';

  try {
    await authService.sendOtp(email);

    isOtpSent = true;
    sendOtpButton.textContent = 'Resend OTP';
    emailInput.disabled = false;

    otpInput.disabled = false;
    passwordInput.disabled = false;

    showToast('OTP sent! Check email.', 'success');
  } catch (error: unknown) {
    sendOtpButton.textContent = 'Send OTP';
    emailInput.disabled = false;

    const message =
      error instanceof Error ? error.message : 'Failed to send OTP.';
    showToast(message, 'error');
  }
});

otpInput.addEventListener('input', async () => {
  const otp = otpInput.value.trim();
  const email = emailInput.value.trim();

  if (isOtpVerified || otp.length !== 6) return;

  showToast('Verifying...', 'info');

  try {
    otpInput.disabled = true;

    await authService.verify(email, otp);

    isOtpVerified = true;
    otpInput.disabled = false;

    showToast('OTP verified! Enter new password.', 'success');
  } catch (error: unknown) {
    isOtpVerified = false;
    otpInput.value = '';
    otpInput.disabled = false;

    const message =
      error instanceof Error ? error.message : 'Invalid OTP.';
    showToast(message, 'error');
  }
});

forgotForm.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  const newPassword = passwordInput.value;

  if (!isOtpSent) {
    showToast('Send OTP first.', 'info');
    return;
  }

  if (!isOtpVerified) {
    showToast('Verify OTP before resetting.', 'info');
    return;
  }

  if (!email || !otp || !newPassword) {
    showToast('All fields required.', 'info');
    return;
  }

  if (newPassword.length < 6) {
    showToast('Password must be 6+ characters.', 'info');
    return;
  }

  resetButton.textContent = 'Resetting...';
  resetButton.disabled = true;

  try {
    await authService.forgetPasswordReset(email, otp, newPassword);

    showToast('Password reset successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'signup';
    }, 2000);
  } catch (error: unknown) {
    resetButton.textContent = 'Reset Password';
    resetButton.disabled = false;

    const message =
      error instanceof Error ? error.message : 'Failed to reset password.';
    showToast(message, 'error');
  }
});
