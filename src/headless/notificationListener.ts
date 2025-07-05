import {AppRegistry} from 'react-native';
import {RNAndroidNotificationListenerHeadlessJsName} from 'react-native-android-notification-listener';
import AppConfigRepository from '../repositories/appConfig.repository';
import {
  NotificationModel,
  NotificationRepository,
} from '../repositories/notification.repository';
import {WebhookService} from '../services/webhook.service';

interface IHeadlessNotification {
  time: string;
  app: string;
  title: string;
  titleBig: string;
  text: string;
  subText: string;
  summaryText: string;
  bigText: string;
  audioContentsURI: string;
  imageBackgroundURI: string;
  extraInfoText: string;
  groupedMessages: Array<{
    title: string;
    text: string;
  }>;
  icon: string; // base64
  iconLarge?: string; // base64 large icon
  image: string; // base64
}

const headlessNotificationListener = async ({
  notification: stringNotification,
}: {
  notification: string;
}) => {
  const parseNotification = () => {
    try {
      return JSON.parse(stringNotification) as IHeadlessNotification;
    } catch (error) {
      return null;
    }
  };
  const notification = parseNotification();
  if (notification) {
    const notificationRepository = new NotificationRepository();
    const appConfigRepository = new AppConfigRepository();
    const appConfig = await appConfigRepository.getConfig();
    console.log('Current appConfig:', appConfig);
    if (!appConfig.isAppAllowed(notification.app)) {
      return;
    }

    const createdNotification = await notificationRepository.create(
      new NotificationModel(notification),
    );
    if (appConfig.webhookUrl) {
      const webhookService = new WebhookService(appConfig.webhookUrl);
      await createdNotification.emitToWebhook(webhookService);
      await notificationRepository.update(createdNotification);
    }
  }
};

export const startHeadlessNotificationListener = () => {
  AppRegistry.registerHeadlessTask(
    RNAndroidNotificationListenerHeadlessJsName,
    () => headlessNotificationListener,
  );
};
