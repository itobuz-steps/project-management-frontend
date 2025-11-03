import '../../../scss/signup.scss';
import authService from '../../services/AuthService.js';

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
    const response = await authService.signup(name, email, password);
    console.log('Registration response:', response);

    localStorage.setItem('pendingEmail', email);
    localStorage.setItem('username', name);

    console.log('Registration successful! Please check your email for OTP.');

    // setTimeout(() => {
    //   window.location.href = '../../../pages/otpVerify.html ';
    // }, 1000);
  } catch (error) {
    console.error('Registration error:', error.message); // Todo: show error.message in form
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    ) {
      console.log(
        'Backend server is not running. Please start your backend server and try again.'
      );
    } else {
      console.log('Registration failed. Please try again.');
    }
  } finally {
    signupBtn.textContent = originalText;
    signupBtn.disabled = false;
  }
}

if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}
