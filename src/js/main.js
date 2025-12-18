import '../style/main.css';
console.log('Hello');

console.log(window.location.pathname);

if (window.location.pathname.startsWith('/invite')) {
  localStorage.setItem(
    'inviteToken',
    new URLSearchParams(window.location.search).get('token')
  );
}

if (localStorage.getItem('access_token')) {
  window.location.href = '/pages/dashboard';
}
