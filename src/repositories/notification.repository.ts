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
  iconLarge?: string; // Base64 large icon data (only used during creation/update)
  image?: string; // Base64 image data (only used during creation/update)
  groupedMessages?: Array<{text: string; title: string}>; // Grouped messages array

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
  public iconLarge?: string; // Base64 large icon data (only used during creation/update)
  public image?: string; // Base64 image data (only used during creation/update)
  public groupedMessages?: Array<{text: string; title: string}>; // Grouped messages array
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
   * If the notification has grouped messages, removes the previous grouped notification from the same app
   * @param notification The notification data
   * @returns The created notification
   */
  async create(notification: INotification): Promise<NotificationModel> {
    try {
      // Check if this notification has grouped messages
      const hasGroupedMessages = notification.groupedMessages && notification.groupedMessages.length > 0;
      
      // If it has grouped messages, find and remove the previous grouped notification from the same app and conversation
      if (hasGroupedMessages) {
        const lastGroupedNotification = await this.findLastGroupedNotificationByAppAndConversation(
          notification.app,
          notification.title,
          notification.titleBig,
          notification.groupedMessages
        );
        if (lastGroupedNotification && lastGroupedNotification._id) {
          console.log(`Found previous grouped notification for increment/replacement for app ${notification.app} (${notification.title}):`, lastGroupedNotification._id);
          console.log('Previous messages:', lastGroupedNotification.groupedMessages?.map(m => m.text).join(', '));
          console.log('New messages:', notification.groupedMessages?.map(m => m.text).join(', '));
          console.log('Action: Replacing previous notification with updated grouping');
          await this.deleteById(lastGroupedNotification._id);
        } else {
          console.log(`No previous grouped notification found or different grouping detected for app ${notification.app} (${notification.title})`);
          console.log('New messages:', notification.groupedMessages?.map(m => m.text).join(', '));
          console.log('Action: Creating new independent grouping');
        }
      }

      // Create notification without base64 data in storage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, iconLarge, image, ...notificationToSave } = notification;
      
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

      // Save large icon separately if provided
      if (notification.iconLarge && createdNotification._id) {
        try {
          await IconStorageService.saveIcon(`${createdNotification._id}_large`, notification.iconLarge);
        } catch (iconError) {
          console.error('Error saving notification large icon:', iconError);
          // Don't fail the notification creation if large icon saving fails
        }
      }

      // Save image separately if provided
      if (notification.image && createdNotification._id) {
        try {
          await IconStorageService.saveIcon(`${createdNotification._id}_image`, notification.image);
        } catch (iconError) {
          console.error('Error saving notification image:', iconError);
          // Don't fail the notification creation if image saving fails
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
      // Update notification without base64 data in storage
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, iconLarge, image, ...notificationToSave } = notification;
      
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

      // Update large icon if provided
      if (notification.iconLarge && notification._id) {
        try {
          await IconStorageService.saveIcon(`${notification._id}_large`, notification.iconLarge);
        } catch (iconError) {
          console.error('Error updating notification large icon:', iconError);
          // Don't fail the notification update if large icon saving fails
        }
      }

      // Update image if provided
      if (notification.image && notification._id) {
        try {
          await IconStorageService.saveIcon(`${notification._id}_image`, notification.image);
        } catch (iconError) {
          console.error('Error updating notification image:', iconError);
          // Don't fail the notification update if image saving fails
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

      // Delete the associated large icon
      try {
        await IconStorageService.deleteIcon(`${id}_large`);
      } catch (iconError) {
        console.error('Error deleting notification large icon:', iconError);
        // Don't fail the notification deletion if large icon deletion fails
      }

      // Delete the associated image
      try {
        await IconStorageService.deleteIcon(`${id}_image`);
      } catch (iconError) {
        console.error('Error deleting notification image:', iconError);
        // Don't fail the notification deletion if image deletion fails
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

  /**
   * Gets the large icon path for a notification
   * @param notificationId The notification ID
   * @returns The large icon file path or null if not found
   */
  async getLargeIconPath(notificationId: string): Promise<string | null> {
    try {
      // Try standard method first
      let iconPath = await IconStorageService.getIconPath(`${notificationId}_large`);
      
      // If that fails, try alternative method (no file:// prefix)
      if (!iconPath) {
        iconPath = await IconStorageService.getIconPathAlternative(`${notificationId}_large`);
      }
      
      return iconPath;
    } catch (error) {
      console.error('Error getting large icon path:', error);
      return null;
    }
  }

  /**
   * Checks if a notification has a large icon
   * @param notificationId The notification ID
   * @returns True if large icon exists, false otherwise
   */
  async hasLargeIcon(notificationId: string): Promise<boolean> {
    try {
      return await IconStorageService.hasIcon(`${notificationId}_large`);
    } catch (error) {
      console.error('Error checking if notification has large icon:', error);
      return false;
    }
  }

  /**
   * Gets the image path for a notification
   * @param notificationId The notification ID
   * @returns The image file path or null if not found
   */
  async getImagePath(notificationId: string): Promise<string | null> {
    try {
      // Try standard method first
      let imagePath = await IconStorageService.getIconPath(`${notificationId}_image`);
      
      // If that fails, try alternative method (no file:// prefix)
      if (!imagePath) {
        imagePath = await IconStorageService.getIconPathAlternative(`${notificationId}_image`);
      }
      
      return imagePath;
    } catch (error) {
      console.error('Error getting image path:', error);
      return null;
    }
  }

  /**
   * Checks if a notification has an image
   * @param notificationId The notification ID
   * @returns True if image exists, false otherwise
   */
  async hasImage(notificationId: string): Promise<boolean> {
    try {
      return await IconStorageService.hasIcon(`${notificationId}_image`);
    } catch (error) {
      console.error('Error checking if notification has image:', error);
      return false;
    }
  }

  /**
   * Finds notifications by app name
   * @param app The app name to search for
   * @returns Array of notifications from the specified app
   */
  async findByApp(app: string): Promise<NotificationModel[]> {
    try {
      const allNotifications = await this.list();
      return allNotifications.filter(notification => notification.app === app);
    } catch (error) {
      console.error('Error finding notifications by app:', error);
      return [];
    }
  }

  /**
   * Checks if the new grouped messages are an extension of the previous ones
   * by comparing the last message of each grouping
   * @param previousMessages Previous grouped messages
   * @param newMessages New grouped messages
   * @returns True if new messages extend the previous ones (same last message)
   */
  private isGroupingExtension(
    previousMessages: Array<{text: string; title: string}>,
    newMessages: Array<{text: string; title: string}>
  ): boolean {
    if (!previousMessages || !newMessages || previousMessages.length === 0 || newMessages.length === 0) {
      return false;
    }

    // New messages must have at least the same amount or more
    if (newMessages.length < previousMessages.length) {
      return false;
    }

    // Check if all previous messages are contained in the new messages in the same order
    let matchCount = 0;
    for (let i = 0; i < previousMessages.length; i++) {
      const prevMsg = previousMessages[i];
      if (i < newMessages.length) {
        const newMsg = newMessages[i];
        if (prevMsg.text === newMsg.text && prevMsg.title === newMsg.title) {
          matchCount++;
        }
      }
    }
    
    // If all previous messages are found in the same positions, it's an extension
    const matchPercentage = matchCount / previousMessages.length;
    
    console.log(`Extension check: ${matchCount}/${previousMessages.length} messages match (${Math.round(matchPercentage * 100)}%)`);
    console.log(`Previous length: ${previousMessages.length}, New length: ${newMessages.length}`);
    
    return matchPercentage >= 0.8; // 80% match required (allowing for some flexibility)
  }

  /**
   * Checks if two grouped messages arrays represent completely different groupings
   * @param previousMessages Previous grouped messages
   * @param newMessages New grouped messages
   * @returns True if they are different groupings that should coexist
   */
  private areDifferentGroupings(
    previousMessages: Array<{text: string; title: string}>,
    newMessages: Array<{text: string; title: string}>
  ): boolean {
    if (!previousMessages || !newMessages || previousMessages.length === 0 || newMessages.length === 0) {
      return true; // If one is empty, they're different
    }

    // Check how many messages from the beginning match in sequence
    let sequentialMatches = 0;
    const minLength = Math.min(previousMessages.length, newMessages.length);
    
    for (let i = 0; i < minLength; i++) {
      const prevMsg = previousMessages[i];
      const newMsg = newMessages[i];
      
      if (prevMsg.text === newMsg.text && prevMsg.title === newMsg.title) {
        sequentialMatches++;
      } else {
        break; // Stop at first mismatch
      }
    }
    
    const sequentialMatchPercentage = sequentialMatches / Math.max(previousMessages.length, 1);
    
    console.log(`Different groupings check: ${sequentialMatches} sequential matches out of ${minLength} compared`);
    console.log(`Sequential match percentage: ${Math.round(sequentialMatchPercentage * 100)}%`);
    
    // If less than 60% of messages match from the beginning, they're different groupings
    return sequentialMatchPercentage < 0.6;
  }

  /**
   * Finds the most recent notification from an app that has grouped messages and matches the conversation
   * @param app The app name to search for
   * @param title The notification title (usually contains contact/conversation name)
   * @param titleBig The notification titleBig for additional matching
   * @param groupedMessages The new grouped messages to compare against
   * @returns The most recent notification with grouped messages that should be replaced, or null if none found
   */
  async findLastGroupedNotificationByAppAndConversation(
    app: string, 
    title: string, 
    titleBig: string,
    groupedMessages?: Array<{text: string; title: string}>
  ): Promise<NotificationModel | null> {
    try {
      const appNotifications = await this.findByApp(app);
      
      // Filter notifications that have grouped messages and match the conversation
      const groupedNotifications = appNotifications.filter(notification => {
        const hasGroupedMessages = notification.groupedMessages && notification.groupedMessages.length > 0;
        const titleMatches = notification.title === title;
        const titleBigMatches = notification.titleBig === titleBig;
        
        // Basic matching
        if (!hasGroupedMessages || !titleMatches || !titleBigMatches) {
          return false;
        }

        // If we have new grouped messages to compare
        if (groupedMessages && groupedMessages.length > 0) {
          // Check if it's an extension/increment (should replace)
          const isExtension = this.isGroupingExtension(notification.groupedMessages!, groupedMessages);
          
          // Check if they are different groupings (should NOT replace)
          const areDifferent = this.areDifferentGroupings(notification.groupedMessages!, groupedMessages);
          
          console.log(`Comparing with existing notification ${notification._id}:`);
          console.log(`  Is extension: ${isExtension}`);
          console.log(`  Are different: ${areDifferent}`);
          console.log(`  Should replace: ${isExtension && !areDifferent}`);
          
          // Only return this notification for replacement if it's an extension
          // If they're different groupings, don't replace
          return isExtension && !areDifferent;
        }

        // If no new messages to compare, use basic title matching (legacy behavior)
        return true;
      });
      
      if (groupedNotifications.length === 0) {
        return null;
      }
      
      // Sort by time (most recent first) and return the first one
      groupedNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return groupedNotifications[0];
    } catch (error) {
      console.error('Error finding last grouped notification by app and conversation:', error);
      return null;
    }
  }
}
