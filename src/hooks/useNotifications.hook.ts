

import React from 'react';
import {
  NotificationModel,
  NotificationRepository,
} from '../repositories/notification.repository';

const notificationRepository = new NotificationRepository();

export default function useNotifications() {
  const [notifications, setNotifications] = React.useState<NotificationModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const getNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const notificationsList = await notificationRepository.list();
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error getting notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await getNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [getNotifications]);

  const clearNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      await notificationRepository.deleteAll();
      await getNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getNotifications]);

  const deleteNotification = React.useCallback(async (notification: NotificationModel) => {
    try {
      if (notification._id) {
        await notificationRepository.deleteById(notification._id);
        await getNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [getNotifications]);

  React.useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  return {
    notifications,
    loading,
    refreshing,
    getNotifications,
    refreshNotifications,
    clearNotifications,
    deleteNotification,
  };
}