import { NotificationRepository } from '../repositories/notification.repository';

/**
 * Utility to test grouped messages functionality
 */
export class GroupedMessagesTest {
  /**
   * Creates a test notification with grouped messages
   */
  public static async createTestNotificationWithGroupedMessages(): Promise<void> {
    try {
      const notificationRepository = new NotificationRepository();
      
      const testNotification = {
        time: Date.now().toString(),
        app: 'WhatsApp',
        title: 'Mensagens de Vitoria',
        text: 'Você tem 3 mensagens novas',
        titleBig: 'WhatsApp - Vitoria',
        extraInfoText: 'Mensagens agrupadas do WhatsApp',
        groupedMessages: [
          { text: 'oi', title: 'Vitoria' },
          { text: '\\oi', title: 'Vitoria' },
          { text: 'oi', title: 'Vitoria' },
          { text: 'como você está?', title: 'Vitoria' },
          { text: 'tudo bem?', title: 'Vitoria' }
        ]
      };

      console.log('Creating test notification with grouped messages...');
      const created = await notificationRepository.create(testNotification);
      console.log('Test notification created:', created._id);
      console.log('Grouped messages saved:', created.groupedMessages?.length);
      
    } catch (error) {
      console.error('Error creating test notification with grouped messages:', error);
    }
  }

  /**
   * Tests the complete grouped messages functionality
   */
  public static async testGroupedMessagesFunctionality(): Promise<void> {
    console.log('=== Testing Grouped Messages Functionality ===');
    
    await this.createTestNotificationWithGroupedMessages();
    
    console.log('=== Grouped Messages Test Complete ===');
  }
}
