/// <reference lib="webworker" />
export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', ((event: Event) => {
  const pushEvent = event as PushEvent;

  let title = 'New Notification';
  const options: NotificationOptions = { body: '' };

  const channel = new BroadcastChannel('sw-messages');

  if (pushEvent.data) {
    try {
      const data = pushEvent.data.json() as {
        title?: string;
        body?: string;
        [key: string]: unknown;
      };

      title = data.title ?? title;
      options.body = data.body ?? '';

      channel.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: data,
      });
    } catch (err) {
      const text = pushEvent.data.text();
      options.body = text;

      console.error(err);

      channel.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: { body: text },
      });
    }
  }

  pushEvent.waitUntil(sw.registration.showNotification(title, options));
}) as EventListener);
