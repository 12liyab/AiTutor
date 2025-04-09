import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { nanoid } from 'nanoid';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  enabled: true,
  setEnabled: () => {},
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  unreadCount: 0,
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load notifications preferences from localStorage
  const storedEnabled = typeof window !== 'undefined' ? localStorage.getItem('notificationsEnabled') : null;
  const storedNotifications = typeof window !== 'undefined' ? localStorage.getItem('notifications') : null;
  
  const [enabled, setEnabled] = useState<boolean>(storedEnabled ? storedEnabled === 'true' : true);
  const [notifications, setNotifications] = useState<Notification[]>(
    storedNotifications 
      ? JSON.parse(storedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      : []
  );
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Persist notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // Persist enabled state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', enabled.toString());
  }, [enabled]);
  
  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    if (!enabled) return;
    
    const newNotification: Notification = {
      ...notification,
      id: nanoid(),
      read: false,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Limit to 50 notifications
  };
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    enabled,
    setEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);