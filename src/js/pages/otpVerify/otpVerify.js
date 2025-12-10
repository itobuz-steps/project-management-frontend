import authService from '../../services/AuthService.js';
import showToast from '../../utils/showToast.js';

const otpInput = document.getElementById('otp-input');
const verifyForm = document.querySelector('.verify-form');

async function handleOtpVerification(event) {
  event.preventDefault();
  const otp = otpInput.value;
  const email = localStorage.getItem('pendingEmail');

  if (!email) {
    showToast('Email not found. Please try registering again.', 'warning');
    window.location.href = 'signup';
    return;
  }

  const verifyButton = document.querySelector('.verify-button');
  const originalText = verifyButton.textContent;
  verifyButton.textContent = 'Verifying...';
  verifyButton.disabled = true;

  try {
    await authService.verify(email, otp);

    localStorage.removeItem('pendingEmail');

    showToast('OTP verified successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard';
    }, 1000);
  } catch (error) {
    showToast(
      error.message || 'OTP verification failed. Please try again.',
      'danger'
    );
  } finally {
    verifyButton.textContent = originalText;
    verifyButton.disabled = false;
  }
}

async function handleResendOtp() {
  const email = localStorage.getItem('pendingEmail');

  if (!email) {
    showToast('Email not found. Please try registering again.', 'warning');
    window.location.href = 'signup.html';
    return;
  }

  try {
    await authService.sendOtp(email);

    showToast('OTP has been resent to your email.');
  } catch (error) {
    showToast(
      error.message || 'Failed to resend OTP. Please try again.',
      'danger'
    );
  } finally {
    resendLink.style.pointerEvents = 'auto';
  }
}

if (verifyForm) {
  verifyForm.addEventListener('submit', handleOtpVerification);
}

const resendLink = document.querySelector('.resend');

if (resendLink) {
  resendLink.addEventListener('click', (e) => {
    e.preventDefault();
    handleResendOtp();
  });
}
