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

// check if service worker exists and push service is supported in the browser
async function checkDependency() {
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js');
      return Notification.requestPermission((permission) => {
        if (permission == 'granted') {
          console.log('Permission given ');
        } else {
          console.log('Permission denied');
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
}
checkDependency();
