//add a push event listener to the browser itself
//self here represents the browser or the service worker

self.addEventListener('push', (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
  });
});
