import authService from '../../services/AuthService';
import showToast from '../../utils/showToast';
import { setTheme } from '../../utils/setTheme';
import { AxiosError } from 'axios';

const signUpTab = document.querySelector<HTMLElement>('.sign-up');
const loginTab = document.querySelector<HTMLElement>('.login');
const signUpFormContainer = document.querySelector<HTMLElement>(
  '.signup-form-container'
);
const loginFormContainer = document.querySelector<HTMLElement>(
  '.login-form-container'
);

// Signup form elements
const usernameInput = document.getElementById(
  'username'
) as HTMLInputElement | null;
const emailInput = document.getElementById('email') as HTMLInputElement | null;
const passwordInput = document.getElementById(
  'password'
) as HTMLInputElement | null;
const signupBtn = document.querySelector<HTMLButtonElement>('.signup-button');
const signupForm = document.querySelector<HTMLFormElement>('.signup-form');

// Login form elements
const loginForm = document.querySelector<HTMLFormElement>('.login-form');
const loginEmail = document.getElementById(
  'email-input'
) as HTMLInputElement | null;
const loginPassword = document.getElementById(
  'password-input'
) as HTMLInputElement | null;
const loginBtn = document.querySelector<HTMLButtonElement>('.login-button');

// Initial UI state
loginFormContainer?.classList.remove('hidden');
signUpFormContainer?.classList.add('hidden');

activateLoginTab();
setTheme(localStorage.getItem('theme') ?? 'indigo');

function activateLoginTab(): void {
  loginTab?.classList.add('active');
  signUpTab?.classList.remove('active');
}

function activateSignUpTab(): void {
  loginTab?.classList.remove('active');
  signUpTab?.classList.add('active');
}

function switchToSignUp(): void {
  signUpFormContainer?.classList.remove('hidden');
  loginFormContainer?.classList.add('hidden');
  activateSignUpTab();
}

function switchToLogin(): void {
  loginFormContainer?.classList.remove('hidden');
  signUpFormContainer?.classList.add('hidden');
  activateLoginTab();
}

signUpTab?.addEventListener('click', switchToSignUp);
loginTab?.addEventListener('click', switchToLogin);

async function handleSignup(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  if (!usernameInput || !emailInput || !passwordInput || !signupBtn) return;

  const name = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const originalText = signupBtn.textContent ?? '';

  signupBtn.textContent = 'Signing up...';
  signupBtn.disabled = true;

  try {
    await authService.signup({ name, email, password });

    localStorage.setItem('pendingEmail', email);
    localStorage.setItem('username', name);

    showToast(
      'Registration successful! Please check your email for OTP.',
      'success'
    );

    setTimeout(() => {
      window.location.href = 'verifyOtpPage.html';
    }, 1000);
  } catch (error) {
    if (!(error instanceof AxiosError)) {
      return;
    }
    
    showToast(error?.message ?? 'Signup failed', 'error');
  } finally {
    signupBtn.textContent = originalText;
    signupBtn.disabled = false;
  }
}
if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}

async function handleLogin(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  if (!loginEmail || !loginPassword || !loginBtn) return;

  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const originalText = loginBtn.textContent ?? '';

  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;

  try {
    await authService.login(email, password);

    localStorage.setItem('userEmail', email);
    showToast('Login successful', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard';
    }, 2000);
  } catch (error) {
    if (!(error instanceof AxiosError)) {
      return;
    }

    showToast(
      error?.response?.data?.message ||
        'Login failed. Please check your credentials.',
      'error'
    );
  } finally {
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}
