self.addEventListener('push', async (event) => {
  let title = 'New Notification';
  let options = { body: '' };

  const channel = new BroadcastChannel('sw-messages');

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options.body = data.body || '';

      // send full payload to client
      channel.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: data,
      });
    } catch (err) {
      const text = event.data.text();
      options.body = text;
      console.log(err);

      channel.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: { body: text },
      });
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});
