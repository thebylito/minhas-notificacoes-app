

import React from 'react';
import {
  NotificationModel,
  NotificationRepository,
} from '../repositories/notification.repository';
import { WebhookService } from '../services/webhook.service';
import AppConfigRepository from '../repositories/appConfig.repository';

const notificationRepository = new NotificationRepository();
const appConfigRepository = new AppConfigRepository();

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

  const sendWebhook = React.useCallback(async (notification: NotificationModel) => {
    try {
      const appConfig = await appConfigRepository.getConfig();
      if (appConfig.webhookUrl) {
        const webhookService = new WebhookService(appConfig.webhookUrl);
        await notification.emitToWebhook(webhookService);
        await notificationRepository.update(notification);
        await getNotifications();
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
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
    sendWebhook,
  };
}