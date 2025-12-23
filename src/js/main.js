import '../style/main.css';

if (window.location.pathname.startsWith('/invite')) {
  localStorage.setItem(
    'inviteToken',
    new URLSearchParams(window.location.search).get('token')
  );
}

if (localStorage.getItem('access_token')) {
  window.location.href = '/pages/dashboard';
}
