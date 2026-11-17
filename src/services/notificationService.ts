import { Notification, NotificationType } from '../types';
import { generateId, getItem, setItem, STORAGE_KEYS } from './storageService';

export const notificationService = {
  getAll(): Notification[] {
    return getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  },

  saveAll(notifications: Notification[]): void {
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  push(
    notifications: Notification[],
    params: {
      userId: string;
      title: string;
      message: string;
      type: NotificationType;
      link?: string;
    }
  ): Notification[] {
    const notification: Notification = {
      id: generateId('notif'),
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [notification, ...notifications];
    this.saveAll(updated);
    return updated;
  },

  markAsRead(notifications: Notification[], notificationId: string): Notification[] {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveAll(updated);
    return updated;
  },

  markAllAsReadForUser(notifications: Notification[], userId: string): Notification[] {
    const updated = notifications.map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    this.saveAll(updated);
    return updated;
  },

  remove(notifications: Notification[], notificationId: string): Notification[] {
    const updated = notifications.filter((n) => n.id !== notificationId);
    this.saveAll(updated);
    return updated;
  },
};
