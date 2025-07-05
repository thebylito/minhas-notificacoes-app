import { BaseRepository } from '../repository/baseRepository';
import { WebhookService } from '../services/webhook.service';
import { IconStorageService } from '../services/iconStorage.service';

export interface INotification {
  _id?: string; // Optional ID for internal use
  time: string;
  app: string;
  title: string;
  text: string;
  titleBig: string;
  extraInfoText: string; // Additional information about the notification
  icon?: string; // Base64 icon data (only used during creation/update)

  hasSentToWebhook?: boolean; // Indicates if the notification has been sent to the webhook
}

export class NotificationModel implements INotification {
  public _id!: string;
  public time!: string;
  public app!: string;
  public title!: string;
  public text!: string;
  public titleBig!: string;
  public extraInfoText!: string; // Additional information about the notification
  public icon?: string; // Base64 icon data (only used during creation/update)
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

  /**
   * Creates a new notification and saves its icon if provided
   * @param notification The notification data
   * @returns The created notification
   */
  async create(notification: INotification): Promise<NotificationModel> {
    try {
      // Create notification without icon in storage
      const notificationToSave = { ...notification };
      delete notificationToSave.icon; // Don't save base64 in AsyncStorage
      
      const notificationModel = new NotificationModel(notificationToSave);
      const createdNotification = await super.create(notificationModel);

      // Save icon separately if provided
      if (notification.icon && createdNotification._id) {
        try {
          await IconStorageService.saveIcon(createdNotification._id, notification.icon);
        } catch (iconError) {
          console.error('Error saving notification icon:', iconError);
          // Don't fail the notification creation if icon saving fails
        }
      }

      return createdNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Updates a notification and manages its icon
   * @param notification The notification to update
   * @returns The updated notification
   */
  async update(notification: NotificationModel): Promise<NotificationModel> {
    try {
      // Update notification without icon in storage
      const notificationToSave = { ...notification };
      delete notificationToSave.icon; // Don't save base64 in AsyncStorage
      
      const notificationModel = new NotificationModel(notificationToSave);
      const updatedNotification = await super.update(notificationModel);

      // Update icon if provided
      if (notification.icon && notification._id) {
        try {
          await IconStorageService.saveIcon(notification._id, notification.icon);
        } catch (iconError) {
          console.error('Error updating notification icon:', iconError);
          // Don't fail the notification update if icon saving fails
        }
      }

      return updatedNotification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  /**
   * Deletes a notification and its associated icon
   * @param id The notification ID
   */
  async deleteById(id: string): Promise<void> {
    try {
      // Delete the notification from storage
      await super.deleteById(id);

      // Delete the associated icon
      try {
        await IconStorageService.deleteIcon(id);
      } catch (iconError) {
        console.error('Error deleting notification icon:', iconError);
        // Don't fail the notification deletion if icon deletion fails
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Deletes all notifications and their icons
   */
  async deleteAll(): Promise<void> {
    try {
      // Delete all notifications from storage
      await super.deleteAll();

      // Clear all icons
      try {
        await IconStorageService.clearAllIcons();
      } catch (iconError) {
        console.error('Error clearing all notification icons:', iconError);
        // Don't fail if icon clearing fails
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Gets the icon path for a notification
   * @param notificationId The notification ID
   * @returns The icon file path or null if not found
   */
  async getIconPath(notificationId: string): Promise<string | null> {
    try {
      // Try standard method first
      let iconPath = await IconStorageService.getIconPath(notificationId);
      
      // If that fails, try alternative method (no file:// prefix)
      if (!iconPath) {
        iconPath = await IconStorageService.getIconPathAlternative(notificationId);
      }
      
      return iconPath;
    } catch (error) {
      console.error('Error getting icon path:', error);
      return null;
    }
  }

  /**
   * Checks if a notification has an icon
   * @param notificationId The notification ID
   * @returns True if icon exists, false otherwise
   */
  async hasIcon(notificationId: string): Promise<boolean> {
    try {
      return await IconStorageService.hasIcon(notificationId);
    } catch (error) {
      console.error('Error checking if notification has icon:', error);
      return false;
    }
  }
}
