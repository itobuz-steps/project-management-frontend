export function checkToken() {
  if (!localStorage.getItem('access_token')) {
    window.location.href = 'signup';
  }
}
