import {BaseRepository} from '../repository/baseRepository';
import {WebhookService} from '../services/webhook.service';

export interface INotification {
  _id?: string; // Optional ID for internal use
  time: string;
  app: string;
  title: string;
  text: string;
  titleBig: string;

  hasSentToWebhook?: boolean; // Indicates if the notification has been sent to the webhook
}

export class NotificationModel implements INotification {
  public _id!: string;
  public time!: string;
  public app!: string;
  public title!: string;
  public text!: string;
  public titleBig!: string;
  public hasSentToWebhook?: boolean = false; // Default value

  constructor(notification: INotification) {
    if (
      !notification ||
      !notification.time ||
      !notification.app ||
      !notification.title
    ) {
      throw new Error('Invalid notification data');
    }
    Object.assign(this, notification);
  }

  async emitToWebhook(webhookService: WebhookService) {
    try {
      if (this.hasSentToWebhook) {
        console.warn('Notification already sent to webhook:', this._id);
        return;
      }
      await webhookService.emit(this);
      this.hasSentToWebhook = true; // Mark as sent
    } catch (error) {
      console.error('Error sending notification to webhook:', error);
      this.hasSentToWebhook = false; // Reset on error
    }
  }
}

export class NotificationRepository extends BaseRepository<NotificationModel> {
  constructor() {
    super(NotificationModel, 'notifications');
  }
}
