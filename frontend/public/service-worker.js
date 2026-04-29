self.addEventListener("push", (event) => {
  const defaultPayload = {
    title: "Cinema Treasures",
    body: "A new notification is ready.",
    url: "/",
  };

  let payload = defaultPayload;

  if (event.data) {
    try {
      const parsedPayload = event.data.json();
      payload = {
        title: parsedPayload.title || defaultPayload.title,
        body: parsedPayload.body || defaultPayload.body,
        url: parsedPayload.url || defaultPayload.url,
      };
    } catch {
      payload = {
        ...defaultPayload,
        body: event.data.text() || defaultPayload.body,
      };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});
