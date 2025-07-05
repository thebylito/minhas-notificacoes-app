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

  /**
   * Tests the removal of previous grouped notifications functionality
   */
  public static async testGroupedNotificationReplacement(): Promise<void> {
    console.log('=== Testing Grouped Notification Replacement ===');
    
    try {
      const notificationRepository = new NotificationRepository();
      
      // Clear all notifications first
      await notificationRepository.deleteAll();
      
      // Create first grouped notification from João
      const firstNotification = {
        time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        app: 'WhatsApp',
        title: 'Mensagens de João',
        text: 'Você tem 2 mensagens novas',
        titleBig: 'WhatsApp - João',
        extraInfoText: 'Primeira notificação agrupada',
        groupedMessages: [
          { text: 'Oi!', title: 'João' },
          { text: 'Como vai?', title: 'João' }
        ]
      };

      console.log('Creating first grouped notification from João...');
      const created1 = await notificationRepository.create(firstNotification);
      console.log('First notification created:', created1._id);
      
      // Create a grouped notification from Maria (different conversation)
      const mariaNotification = {
        time: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
        app: 'WhatsApp',
        title: 'Mensagens de Maria',
        text: 'Você tem 1 mensagem nova',
        titleBig: 'WhatsApp - Maria',
        extraInfoText: 'Notificação de Maria',
        groupedMessages: [
          { text: 'Olá!', title: 'Maria' }
        ]
      };

      console.log('Creating grouped notification from Maria (different conversation)...');
      const created2 = await notificationRepository.create(mariaNotification);
      console.log('Maria notification created:', created2._id);
      
      // Verify we have 2 notifications (both should be preserved)
      let allNotifications = await notificationRepository.list();
      console.log('Total notifications after Maria creation:', allNotifications.length);
      
      if (allNotifications.length === 2) {
        console.log('✅ SUCCESS: Different conversations are preserved');
      } else {
        console.log('❌ FAILURE: Different conversations were not preserved correctly');
      }
      
      // Create second grouped notification from João (same conversation - should replace the first)
      const secondJoaoNotification = {
        time: new Date().toISOString(), // now
        app: 'WhatsApp',
        title: 'Mensagens de João',
        text: 'Você tem 4 mensagens novas',
        titleBig: 'WhatsApp - João',
        extraInfoText: 'Segunda notificação agrupada do João (deve substituir a primeira)',
        groupedMessages: [
          { text: 'Oi!', title: 'João' },
          { text: 'Como vai?', title: 'João' },
          { text: 'Tudo bem por aí?', title: 'João' },
          { text: 'Responde aí!', title: 'João' }
        ]
      };

      console.log('Creating second grouped notification from João (should replace first)...');
      const created3 = await notificationRepository.create(secondJoaoNotification);
      console.log('Second João notification created:', created3._id);
      
      // Verify we still have 2 notifications (João's first should be removed, Maria's preserved)
      allNotifications = await notificationRepository.list();
      console.log('Total notifications after second João creation:', allNotifications.length);
      
      // Check which notifications remain
      const remainingApps = allNotifications.map(n => `${n.title} (${n._id})`);
      console.log('Remaining notifications:', remainingApps);
      
      // Verify that Maria's notification is still there and João's latest is there
      const mariaExists = allNotifications.some(n => n.title === 'Mensagens de Maria');
      const joaoLatestExists = allNotifications.some(n => n._id === created3._id);
      const joaoFirstExists = allNotifications.some(n => n._id === created1._id);
      
      if (allNotifications.length === 2 && mariaExists && joaoLatestExists && !joaoFirstExists) {
        console.log('✅ SUCCESS: Same conversation replacement works correctly');
        console.log('✅ SUCCESS: Different conversations are preserved');
      } else {
        console.log('❌ FAILURE: Conversation-specific replacement failed');
        console.log(`  Maria exists: ${mariaExists}`);
        console.log(`  João latest exists: ${joaoLatestExists}`);
        console.log(`  João first exists (should be false): ${joaoFirstExists}`);
      }
      
      // Test with a different app to ensure it doesn't affect other apps
      const telegramNotification = {
        time: new Date().toISOString(),
        app: 'Telegram',
        title: 'Mensagens de João',
        text: 'Você tem 1 mensagem nova',
        titleBig: 'Telegram - João',
        extraInfoText: 'João no Telegram (app diferente)',
        groupedMessages: [
          { text: 'Oi pelo Telegram!', title: 'João' }
        ]
      };

      console.log('Creating notification from different app (Telegram)...');
      const created4 = await notificationRepository.create(telegramNotification);
      console.log('Telegram notification created:', created4._id);
      
      // Verify we now have 3 notifications (WhatsApp João, WhatsApp Maria, Telegram João)
      allNotifications = await notificationRepository.list();
      console.log('Total notifications after Telegram creation:', allNotifications.length);
      
      if (allNotifications.length === 3) {
        console.log('✅ SUCCESS: Different app notifications are preserved');
      } else {
        console.log('❌ FAILURE: Different app notifications were not handled correctly');
      }
      
    } catch (error) {
      console.error('Error testing grouped notification replacement:', error);
    }
    
    console.log('=== Grouped Notification Replacement Test Complete ===');
  }

  /**
   * Tests the specific scenario described by the user:
   * First grouping: 6,7,8,9,10
   * Second grouping: 11,12,13,14,15
   * These should NOT replace each other as they are different groupings
   */
  public static async testDifferentMessageGroupings(): Promise<void> {
    console.log('=== Testing Different Message Groupings (Should NOT Replace) ===');
    
    try {
      const notificationRepository = new NotificationRepository();
      
      // Clear all notifications first
      await notificationRepository.deleteAll();
      
      // Create first grouped notification with messages 6,7,8,9,10
      const firstGrouping = {
        time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        app: 'WhatsApp',
        title: 'Mensagens de João',
        text: 'Você tem 5 mensagens novas',
        titleBig: 'WhatsApp - João',
        extraInfoText: 'Primeiro agrupamento (6-10)',
        groupedMessages: [
          { text: 'Mensagem 6', title: 'João' },
          { text: 'Mensagem 7', title: 'João' },
          { text: 'Mensagem 8', title: 'João' },
          { text: 'Mensagem 9', title: 'João' },
          { text: 'Mensagem 10', title: 'João' }
        ]
      };

      console.log('Creating first grouping (6,7,8,9,10)...');
      const created1 = await notificationRepository.create(firstGrouping);
      console.log('First grouping created:', created1._id);
      console.log('Messages:', created1.groupedMessages?.map(m => m.text).join(', '));
      
      // Create second grouped notification with messages 11,12,13,14,15 (completely different)
      const secondGrouping = {
        time: new Date().toISOString(), // now
        app: 'WhatsApp',
        title: 'Mensagens de João',
        text: 'Você tem 5 mensagens novas',
        titleBig: 'WhatsApp - João',
        extraInfoText: 'Segundo agrupamento (11-15) - deve manter o primeiro',
        groupedMessages: [
          { text: 'Mensagem 11', title: 'João' },
          { text: 'Mensagem 12', title: 'João' },
          { text: 'Mensagem 13', title: 'João' },
          { text: 'Mensagem 14', title: 'João' },
          { text: 'Mensagem 15', title: 'João' }
        ]
      };

      console.log('Creating second grouping (11,12,13,14,15) - should NOT replace first...');
      const created2 = await notificationRepository.create(secondGrouping);
      console.log('Second grouping created:', created2._id);
      console.log('Messages:', created2.groupedMessages?.map(m => m.text).join(', '));
      
      // Verify we have 2 notifications (both should be preserved as they are different groupings)
      const allNotifications = await notificationRepository.list();
      console.log('Total notifications after second grouping creation:', allNotifications.length);
      
      // Check which notifications remain
      const remainingNotifications = allNotifications.map(n => ({
        id: n._id,
        messages: n.groupedMessages?.map(m => m.text).join(', ')
      }));
      console.log('Remaining notifications:');
      remainingNotifications.forEach(n => {
        console.log(`  ID: ${n.id}, Messages: ${n.messages}`);
      });
      
      // Verify both notifications exist
      const firstExists = allNotifications.some(n => n._id === created1._id);
      const secondExists = allNotifications.some(n => n._id === created2._id);
      
      if (allNotifications.length === 2 && firstExists && secondExists) {
        console.log('✅ SUCCESS: Different message groupings are preserved correctly');
        console.log('✅ SUCCESS: No unwanted replacement occurred');
      } else {
        console.log('❌ FAILURE: Different message groupings were incorrectly handled');
        console.log(`  First grouping exists: ${firstExists}`);
        console.log(`  Second grouping exists: ${secondExists}`);
        console.log(`  Total notifications: ${allNotifications.length} (expected: 2)`);
      }
      
    } catch (error) {
      console.error('Error testing different message groupings:', error);
    }
    
    console.log('=== Different Message Groupings Test Complete ===');
  }

  /**
   * Tests the increment/extension scenario:
   * When new messages extend previous ones, should replace the previous notification
   */
  public static async testGroupingIncrement(): Promise<void> {
    console.log('=== Testing Grouping Increment (Should Replace) ===');
    
    try {
      const notificationRepository = new NotificationRepository();
      
      // Clear all notifications first
      await notificationRepository.deleteAll();
      
      // Create first grouped notification with 3 messages
      const initialGrouping = {
        time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        app: 'WhatsApp',
        title: 'Mensagens de Maria',
        text: 'Você tem 3 mensagens novas',
        titleBig: 'WhatsApp - Maria',
        extraInfoText: 'Agrupamento inicial (3 mensagens)',
        groupedMessages: [
          { text: 'Oi!', title: 'Maria' },
          { text: 'Como você está?', title: 'Maria' },
          { text: 'Tudo bem por aí?', title: 'Maria' }
        ]
      };

      console.log('Creating initial grouping (3 messages)...');
      const created1 = await notificationRepository.create(initialGrouping);
      console.log('Initial grouping created:', created1._id);
      console.log('Messages:', created1.groupedMessages?.map(m => m.text).join(', '));
      
      // Create extended grouped notification (same messages + new ones)
      const extendedGrouping = {
        time: new Date().toISOString(), // now
        app: 'WhatsApp',
        title: 'Mensagens de Maria',
        text: 'Você tem 5 mensagens novas',
        titleBig: 'WhatsApp - Maria',
        extraInfoText: 'Agrupamento estendido (5 mensagens) - deve substituir o inicial',
        groupedMessages: [
          { text: 'Oi!', title: 'Maria' },
          { text: 'Como você está?', title: 'Maria' },
          { text: 'Tudo bem por aí?', title: 'Maria' },
          { text: 'Me responde!', title: 'Maria' },
          { text: 'Alooooo!', title: 'Maria' }
        ]
      };

      console.log('Creating extended grouping (5 messages) - should replace initial...');
      const created2 = await notificationRepository.create(extendedGrouping);
      console.log('Extended grouping created:', created2._id);
      console.log('Messages:', created2.groupedMessages?.map(m => m.text).join(', '));
      
      // Verify we have only 1 notification (initial should be replaced)
      const allNotifications = await notificationRepository.list();
      console.log('Total notifications after extension:', allNotifications.length);
      
      // Check which notification remains
      if (allNotifications.length === 1) {
        const remaining = allNotifications[0];
        console.log('Remaining notification ID:', remaining._id);
        console.log('Remaining messages:', remaining.groupedMessages?.map(m => m.text).join(', '));
        console.log('Message count:', remaining.groupedMessages?.length);
        
        // Verify it's the extended one
        const isExtendedVersion = remaining._id === created2._id && remaining.groupedMessages?.length === 5;
        const initialRemoved = !allNotifications.some(n => n._id === created1._id);
        
        if (isExtendedVersion && initialRemoved) {
          console.log('✅ SUCCESS: Grouping increment/extension works correctly');
          console.log('✅ SUCCESS: Previous grouping was replaced with extended version');
        } else {
          console.log('❌ FAILURE: Grouping increment failed');
          console.log(`  Extended version exists: ${isExtendedVersion}`);
          console.log(`  Initial version removed: ${initialRemoved}`);
        }
      } else {
        console.log('❌ FAILURE: Expected 1 notification, got:', allNotifications.length);
      }
      
    } catch (error) {
      console.error('Error testing grouping increment:', error);
    }
    
    console.log('=== Grouping Increment Test Complete ===');
  }

  /**
   * Tests the specific user scenario: 5-8 followed by 5-9 (should replace)
   */
  public static async testUserScenario(): Promise<void> {
    console.log('=== Testing User Scenario: 5-8 then 5-9 (Should Replace) ===');
    
    try {
      const notificationRepository = new NotificationRepository();
      
      // Clear all notifications first
      await notificationRepository.deleteAll();
      
      // Create first grouped notification: Vitoria 5,6,7,8
      const firstGrouping = {
        time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        app: 'com.whatsapp',
        title: 'Vitoria',
        text: 'Novas mensagens: 4',
        titleBig: 'Mensagens Agrupadas',
        extraInfoText: 'Primeiro agrupamento (5-8)',
        groupedMessages: [
          { text: '5', title: 'Vitoria' },
          { text: '6', title: 'Vitoria' },
          { text: '7', title: 'Vitoria' },
          { text: '8', title: 'Vitoria' }
        ]
      };

      console.log('Creating first grouping (5,6,7,8)...');
      const created1 = await notificationRepository.create(firstGrouping);
      console.log('First grouping created:', created1._id);
      console.log('Messages:', created1.groupedMessages?.map(m => m.text).join(', '));
      
      // Create second grouped notification: Vitoria 5,6,7,8,9 (extension)
      const secondGrouping = {
        time: new Date().toISOString(), // now
        app: 'com.whatsapp',
        title: 'Vitoria',
        text: 'Novas mensagens: 5',
        titleBig: 'Mensagens Agrupadas',
        extraInfoText: 'Segundo agrupamento (5-9) - deve substituir o primeiro',
        groupedMessages: [
          { text: '5', title: 'Vitoria' },
          { text: '6', title: 'Vitoria' },
          { text: '7', title: 'Vitoria' },
          { text: '8', title: 'Vitoria' },
          { text: '9', title: 'Vitoria' }
        ]
      };

      console.log('Creating second grouping (5,6,7,8,9) - should replace first...');
      const created2 = await notificationRepository.create(secondGrouping);
      console.log('Second grouping created:', created2._id);
      console.log('Messages:', created2.groupedMessages?.map(m => m.text).join(', '));
      
      // Verify we have only 1 notification (first should be replaced)
      const allNotifications = await notificationRepository.list();
      console.log('Total notifications after second grouping:', allNotifications.length);
      
      if (allNotifications.length === 1) {
        const remaining = allNotifications[0];
        console.log('Remaining notification ID:', remaining._id);
        console.log('Remaining messages:', remaining.groupedMessages?.map(m => m.text).join(', '));
        console.log('Message count:', remaining.groupedMessages?.length);
        
        // Verify it's the second one (with 5 messages)
        const isSecondVersion = remaining._id === created2._id && remaining.groupedMessages?.length === 5;
        const firstRemoved = !allNotifications.some(n => n._id === created1._id);
        
        if (isSecondVersion && firstRemoved) {
          console.log('✅ SUCCESS: User scenario works correctly (5-8 replaced by 5-9)');
          console.log('✅ SUCCESS: Extension detection and replacement working');
        } else {
          console.log('❌ FAILURE: User scenario failed');
          console.log(`  Second version exists: ${isSecondVersion}`);
          console.log(`  First version removed: ${firstRemoved}`);
        }
      } else {
        console.log('❌ FAILURE: Expected 1 notification, got:', allNotifications.length);
        allNotifications.forEach(n => {
          console.log(`  - ID: ${n._id}, Messages: ${n.groupedMessages?.map(m => m.text).join(', ')}`);
        });
      }
      
    } catch (error) {
      console.error('Error testing user scenario:', error);
    }
    
    console.log('=== User Scenario Test Complete ===');
  }
}
