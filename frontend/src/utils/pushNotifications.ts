import type { PushSubscription as AppPushSubscription } from '../types';

const DEFAULT_NOTIFICATION_TITLE = 'Cinema Treasures';

export const isPushNotificationsSupported = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const normalizedValue = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(normalizedValue);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const arrayBufferToBase64 = (value: ArrayBuffer) => {
  const bytes = new Uint8Array(value);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window.btoa(binary);
};

export const serializePushSubscription = (
  subscription: globalThis.PushSubscription,
): AppPushSubscription => {
  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');

  if (!p256dh || !auth) {
    throw new Error('The browser returned an invalid push subscription.');
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(p256dh),
      auth: arrayBufferToBase64(auth),
    },
  };
};

export const getPermissionErrorMessage = (permission: NotificationPermission) => {
  if (permission === 'denied') {
    return 'Notifications are blocked in your browser settings.';
  }

  return 'Notification permission was dismissed before it could be enabled.';
};

export const getNotificationTitle = () => DEFAULT_NOTIFICATION_TITLE;
