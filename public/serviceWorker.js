self.addEventListener('push', async (event) => {
  let title = 'New Notification';
  let options = { body: '' };

  console.log('Notification received', await event.data.json());
  if (event.data) {
    try {
      const data = await event.data.json();
      title = data.title || title;
      options.body = data.body || '';
    } catch {
      const text = await event.data.text();
      options.body = text;
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});
