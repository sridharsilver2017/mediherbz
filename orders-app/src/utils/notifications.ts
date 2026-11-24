import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Order } from '../types';

let channelCreated = false;

const ensureAndroidChannel = async () => {
  if (!Capacitor.isNativePlatform() || channelCreated) return;
  try {
    await LocalNotifications.createChannel({
      id: 'orders_channel',
      name: 'Order Alerts',
      description: 'Instant notification when customer places a new order',
      importance: 5, // High importance (heads-up notification + sound + vibration)
      visibility: 1,
      vibration: true,
    });
    channelCreated = true;
  } catch (e) {
    console.warn('Error creating android notification channel:', e);
  }
};

/**
 * High-quality pleasant store chime using the Web Audio API.
 * Synthesizes a melodic 3-tone chime (D5 -> A5 -> D6) with zero external assets needed.
 */
export const playOrderChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes: D5 (587.33Hz), A5 (880.00Hz), D6 (1174.66Hz)
    const notes = [587.33, 880.0, 1174.66];
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.28, now + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.65);
    });
  } catch (err) {
    console.warn('Web Audio chime could not play:', err);
  }
};

/**
 * Check if the browser or native app supports notifications and what current status is.
 */
export const getNotificationPermission = (): boolean => {
  if (typeof window === 'undefined') return false;

  if (localStorage.getItem('mediherbz_notifications_enabled') === 'true') {
    return true;
  }

  if (!Capacitor.isNativePlatform() && 'Notification' in window) {
    return Notification.permission === 'granted';
  }

  return false;
};

/**
 * Request system notification permissions from user (supports Android native & Web).
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  // 1. Native Android App via Capacitor LocalNotifications
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureAndroidChannel();
      const res = await LocalNotifications.requestPermissions();
      if (res.display === 'granted') {
        localStorage.setItem('mediherbz_notifications_enabled', 'true');
        playOrderChime();
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000) + 1,
              title: '🌿 Mediherbz Order Alerts Active',
              body: 'You will receive instant native notifications and chimes for incoming orders.',
              channelId: 'orders_channel',
              schedule: { at: new Date(Date.now() + 300) },
            },
          ],
        });
        return true;
      }
      alert('Notification permission was not granted. Please enable notifications in your phone Settings -> Apps -> Mediherbz Orders.');
      return false;
    } catch (err) {
      console.error('Failed to request native notification permission:', err);
      return false;
    }
  }

  // 2. Desktop & Mobile Web Browser
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('This browser does not support desktop/push notifications.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('mediherbz_notifications_enabled', 'true');
      playOrderChime();
      new Notification('🌿 Mediherbz Order Alerts Enabled', {
        body: 'You will receive instant chimes and push alerts for new customer bookings.',
        icon: 'https://dev-medinerbz.pantheonsite.io/wp-content/uploads/2026/11/cropped-favicon-32x32.png',
      });
      return true;
    }
  } catch (err) {
    console.error('Failed to request notification permission:', err);
  }
  return false;
};

/**
 * Display native OS push notification for a new incoming order.
 */
export const showOrderPushNotification = async (order: Order, onClick?: (order: Order) => void) => {
  // Always play the store audio chime
  playOrderChime();

  // 1. Native Android Notification
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureAndroidChannel();
      const paymentTag = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Prepaid Online';
      const notificationId = (Number(order.id) % 2147483647) || Math.floor(Math.random() * 100000) + 1;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `🔔 New Order: #${order.order_number || order.id}`,
            body: `${order.customer.name} ordered for ₹${order.total.toLocaleString('en-IN')} (${paymentTag}). Tap to dispatch!`,
            channelId: 'orders_channel',
            schedule: { at: new Date(Date.now() + 100) },
            extra: { orderId: order.id },
          },
        ],
      });
    } catch (err) {
      console.warn('Native notification error:', err);
    }
    return;
  }

  // 2. Web Browser Fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const paymentTag = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Prepaid Online';
      const notification = new Notification(`🔔 New Order Received: ${order.order_number}`, {
        body: `${order.customer.name} placed an order for ₹${order.total.toLocaleString('en-IN')} (${paymentTag}). Tap to dispatch!`,
        icon: 'https://dev-medinerbz.pantheonsite.io/wp-content/uploads/2026/11/cropped-favicon-32x32.png',
        tag: `order-${order.id}`,
      });

      notification.onclick = () => {
        window.focus();
        if (onClick) onClick(order);
        notification.close();
      };
    } catch (err) {
      console.warn('Could not trigger Notification API:', err);
    }
  }
};
