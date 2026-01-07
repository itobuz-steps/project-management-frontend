import '../style/main.css';

if (window.location.pathname.startsWith('/invite')) {
  localStorage.setItem(
    'inviteToken',
    new URLSearchParams(window.location.search).get('token')
  );
  window.location.href = '/pages/signup';
}

if (localStorage.getItem('access_token')) {
  window.location.href = '/pages/dashboard';
} else {
  window.location.href = '/pages/signup';
}
if (window.location.pathname === '/') {
  window.location.href = '/pages/signup';
}
