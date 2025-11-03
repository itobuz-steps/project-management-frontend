import '../../../styles/signup.scss';

console.log('test');

const signUpTab = document.querySelector('.sign-up');
const loginTab = document.querySelector('.login');
const signUpFormContainer = document.querySelector('.signup-form-container');
const loginFormContainer = document.querySelector('.login-form-container');

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
