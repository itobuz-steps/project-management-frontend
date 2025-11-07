import authService from '../../services/AuthService.js';
import { showMessage, showToast } from '../../utils/showMessage.js';

const signUpTab = document.querySelector('.sign-up');
const loginTab = document.querySelector('.login');
const signUpFormContainer = document.querySelector('.signup-form-container');
const loginFormContainer = document.querySelector('.login-form-container');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.querySelector('.signup-button');
const signupForm = document.querySelector('.signup-form');

loginFormContainer.classList.remove('hidden');
signUpFormContainer.classList.add('hidden');

activateLoginTab();

function activateLoginTab() {
  loginTab.classList.add('bg-[#8c91ff]', 'text-white', 'shadow-md');
  loginTab.classList.remove(
    'bg-[#eef0f7]',
    'text-[#2b2d42]',
    'hover:bg-white',
    'hover:text-[#8c91ff]'
  );

  signUpTab.classList.remove('bg-[#8c91ff]', 'text-white', 'shadow-md');
  signUpTab.classList.add(
    'bg-[#eef0f7]',
    'text-[#2b2d42]',
    'hover:bg-white',
    'hover:text-[#8c91ff]'
  );
}

function activateSignUpTab() {
  signUpTab.classList.add('bg-[#8c91ff]', 'text-white', 'shadow-md');
  signUpTab.classList.remove(
    'bg-[#eef0f7]',
    'text-[#2b2d42]',
    'hover:bg-white',
    'hover:text-[#8c91ff]'
  );

  loginTab.classList.remove('bg-[#8c91ff]', 'text-white', 'shadow-md');
  loginTab.classList.add(
    'bg-[#eef0f7]',
    'text-[#2b2d42]',
    'hover:bg-white',
    'hover:text-[#8c91ff]'
  );
}

function switchToSignUp() {
  signUpFormContainer.classList.remove('hidden');
  loginFormContainer.classList.add('hidden');
  activateSignUpTab();
}

function switchToLogin() {
  loginFormContainer.classList.remove('hidden');
  signUpFormContainer.classList.add('hidden');
  activateLoginTab();
}

signUpTab.addEventListener('click', switchToSignUp);
loginTab.addEventListener('click', switchToLogin);

async function handleSignup(event) {
  event.preventDefault();

  const name = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const originalText = signupBtn.textContent;

  signupBtn.textContent = 'Signing up...';
  signupBtn.disabled = true;

  try {
    await authService.signup(name, email, password);

    localStorage.setItem('pendingEmail', email);
    localStorage.setItem('username', name);

    showMessage(
      'Registration successful! Please check your email for OTP.',
      'success',
      'signup-message'
    );

    setTimeout(() => {
      window.location.href = 'verifyOtpPage.html';
    }, 1000);
  } catch (error) {
    showMessage(error.message, 'danger', 'signup-message');
  } finally {
    signupBtn.textContent = originalText;
    signupBtn.disabled = false;
  }
}

if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}

const loginForm = document.querySelector('.login-form');
const loginEmail = document.getElementById('email-input');
const loginPassword = document.getElementById('password-input');
const loginBtn = document.querySelector('.login-button');

async function handleLogin(event) {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const originalText = loginBtn.textContent;

  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;

  try {
    await authService.login(email, password);
    showToast('Login successful', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard';
    }, 2000);
  } catch (error) {
    showMessage(
      error.response?.data?.message ||
        'Login failed. Please check your credentials.',
      'danger'
    );
  } finally {
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}
