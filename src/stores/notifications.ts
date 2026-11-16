import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationCategory = 'stock' | 'order' | 'sync' | 'system' | 'message';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO string
  category: NotificationCategory;
  read: boolean;
  actionUrl?: string;
  badge?: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert',
    description: 'Espresso Beans (Dark Roast) is below minimum threshold (2.5 kg remaining).',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    category: 'stock',
    read: false,
    actionUrl: '/inventory',
    badge: 'Stock Warning',
  },
  {
    id: 'notif-2',
    title: 'Kitchen Order Ready',
    description: 'Table 04 items (2x Latte, 1x Panini) marked ready for service.',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    category: 'order',
    read: false,
    actionUrl: '/kds',
    badge: 'Kitchen KDS',
  },
  {
    id: 'notif-3',
    title: 'Cloud Synchronization OK',
    description: 'All local offline transactions were synchronized with cloud database.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    category: 'sync',
    read: false,
    actionUrl: '/dashboard',
    badge: 'Sync Engine',
  },
  {
    id: 'notif-4',
    title: 'Cash Drawer Float Active',
    description: 'Register #01 session is open with initial opening float.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'system',
    read: true,
    actionUrl: '/cash',
    badge: 'Cash Session',
  },
];

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATIONS,

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      addNotification: (item) =>
        set((state) => ({
          notifications: [
            {
              ...item,
              id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'synqpos-notifications',
    }
  )
);
