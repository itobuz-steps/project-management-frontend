import '../../../scss/signup.scss';
import authService from '../../services/AuthService.js';
import { showMessage } from '../../utils/showMessage.js';

const signUpTab = document.querySelector('.sign-up');
const loginTab = document.querySelector('.login');
const signUpFormContainer = document.querySelector('.signup-form-container');
const loginFormContainer = document.querySelector('.login-form-container');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.querySelector('.signup-button');
const signupForm = document.querySelector('.signup-form');

loginFormContainer.classList.add('active-form');

function switchToSignUp() {
  signUpTab.classList.add('active');
  loginTab.classList.remove('active');

  signUpFormContainer.classList.add('active-form');
  loginFormContainer.classList.remove('active-form');
}

function switchToLogin() {
  loginTab.classList.add('active');
  signUpTab.classList.remove('active');

  loginFormContainer.classList.add('active-form');
  signUpFormContainer.classList.remove('active-form');
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
    console.log(error.message);
    showMessage(`${error.message}`, 'danger', 'signup-message');
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    ) {
      console.log(
        'Backend server is not running. Please start your backend server and try again.'
      );
    } else {
      showMessage(
        'Registration failed. Please try again.',
        'danger',
        'signup-message'
      );
    }
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

    showMessage('Login successful', 'success');

    setTimeout(() => {
      window.location.href = 'index';
    }, 1000);
  } catch (error) {
    showMessage(
      error.response.data.message ||
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
