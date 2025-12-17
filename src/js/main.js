import axios from 'axios';
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
      await navigator.serviceWorker.register('/serviceWorker.js'); //rechek the file path

      console.log('service worker registered');

      const permission = await Notification.requestPermission();

      if (permission == 'granted') {
        console.log('Permission given ');
      } else {
        console.log('Permission denied');
      }
    }
  } catch (error) {
    console.error(error);
  }
}
checkDependency();

//subscribe to the push notification service
async function subscribeUser(userId) {
  try {
    const readyState = await navigator.serviceWorker.ready; //get service worker to be ready

    console.log(readyState);

    //code can break here
    const subscription = await readyState.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.fromBase64(
        'BFXMoAE33LgnmD-NWPYRnxKtRfT3aHE8uxvtBlcs8VJu9qDahVUlcD2bq6R2sNPF1hhrFw8C6bYz-9zo8dFyHf8'
      ),
    });

    console.log('subscription object', subscription);
    console.log('subscription endpoint', subscription.endpoint);

    //send ths subscription to the backend
    await axios.post('/subscribe', {
      userId,
      subscription,
    });
  } catch (error) {
    console.error('Failed to subscribe', error);
  }
}

subscribeUser();
