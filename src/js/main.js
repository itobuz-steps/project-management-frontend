import '../style/main.css';

// Use path checks that work on file://, nested folders, and static hosts.
const path = window.location.pathname;
const isIndex =
  path.endsWith('/') ||
  path.endsWith('/index.html') ||
  path.endsWith('index.html');
const isInvite = path.includes('/invite');

if (isInvite) {
  localStorage.setItem(
    'inviteToken',
    new URLSearchParams(window.location.search).get('token')
  );
  window.location.href = './pages/signup.html';
} else if (localStorage.getItem('access_token')) {
  window.location.href = './pages/dashboard.html';
} else if (isIndex) {
  window.location.href = './pages/signup.html';
}
