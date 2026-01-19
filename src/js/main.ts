// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import '../style/main.css';

if (window.location.pathname.startsWith('/invite')) {
  const token = new URLSearchParams(window.location.search).get('token');

  if (token) {
    localStorage.setItem('inviteToken', token);
  }

  window.location.href = '/pages/signup';
}

if (localStorage.getItem('access_token')) {
  window.location.href = '/pages/dashboard';
}
if (window.location.pathname === '/') {
  window.location.href = '/pages/signup';
}
