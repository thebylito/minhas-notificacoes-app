import React from 'react';
import {
  View,
  Text,
  Card,
  Badge,
  TouchableOpacity,
  Image,
} from 'react-native-ui-lib';
import {
  NotificationModel,
  NotificationRepository,
} from '../repositories/notification.repository';
import { WebhookService } from '../services/webhook.service';
import useAppConfig from '../hooks/useAppConfig.hook';

interface NotificationCardProps {
  notification: NotificationModel;
  onDelete: (notification: NotificationModel) => void;
}

export default function NotificationCard({
  notification,
  onDelete,
}: NotificationCardProps) {
  const [iconPath, setIconPath] = React.useState<string | null>(null);
  const [isGroupedMessagesExpanded, setIsGroupedMessagesExpanded] = React.useState(false);
  const { config } = useAppConfig();
  const notificationRepository = React.useMemo(
    () => new NotificationRepository(),
    [],
  );

  // Load icon path when component mounts or notification changes
  React.useEffect(() => {
    const loadIcon = async () => {
      if (notification._id) {
        const path = await notificationRepository.getIconPath(notification._id);
        setIconPath(path);
      }
    };
    loadIcon();
  }, [notification._id, notificationRepository]);

  const handleSendWebhook = async () => {
    try {
      if (!config?.webhookUrl) {
        console.warn('Webhook URL não configurada');
        return;
      }
      
      const webhookService = new WebhookService(config.webhookUrl);
      await notification.emitToWebhook(webhookService);
      
      // Atualizar a notificação no repository
      await notificationRepository.update(notification);
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
    }
  };
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(Number(timeString));
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeString;
    }
  };

  const handleDelete = () => {
    onDelete(notification);
  };

  return (
    <Card
      padding-s4
      marginV-s2
      marginH-s3
      enableShadow
      borderRadius={6}
      backgroundColor={notification.hasSentToWebhook ? '#f0f9f0' : '#ffffff'}>
        <View row centerV spread marginB-s2>
          <View row centerV flex>
            {iconPath && (
              <View
                backgroundColor="#6366f1"
                center
                marginR-s1
                padding-s1
                width={28}
                height={28}
                style={{borderRadius: 6}}>
                <Image
                  width={16}
                  height={16}
                  source={{uri: iconPath}}
                  resizeMode="contain"
                />
              </View>
            )}
            <Badge
              label={notification.app}
              size={18}
              backgroundColor="#6366f1"
              borderRadius={6}
            />
          </View>
          {notification.hasSentToWebhook && (
            <Badge
              label="Enviado"
              size={16}
              backgroundColor="#10b981"
            />
          )}
        </View>

        <Text text70 grey10 numberOfLines={2} marginB-s1>
          {notification.title}
        </Text>

        {notification.titleBig &&
          notification.titleBig !== notification.title && (
            <Text text80 grey30 numberOfLines={1} marginB-s1>
              {notification.titleBig}
            </Text>
          )}

        {notification.text && (
          <Text text90 grey30 numberOfLines={3}>
            {notification.text}
          </Text>
        )}

        {notification.extraInfoText && (
          <Text text90 grey30 numberOfLines={3}>
            {notification.extraInfoText}
          </Text>
        )}

        {notification.groupedMessages && notification.groupedMessages.length > 0 && (
          <View marginT-s2>
            <View row centerV marginB-s1>
              <Text text80 grey20>
                Mensagens Agrupadas
              </Text>
              <View 
                backgroundColor="#6366f1"
                paddingH-s1
                paddingV-1
                marginL-s1
                style={{borderRadius: 10}}
              >
                <Text text100 white>
                  {notification.groupedMessages.length}
                </Text>
              </View>
            </View>
            <View backgroundColor="#f8fafc" padding-s2 style={{borderRadius: 6}}>
              {(isGroupedMessagesExpanded 
                ? notification.groupedMessages 
                : notification.groupedMessages.slice(0, 3)
              ).map((message, index) => (
                <View key={index} marginB-s1 row>
                  <Text text90 grey20 marginR-s1>•</Text>
                  <View flex>
                    <Text text90 grey10 numberOfLines={2}>
                      <Text text90 grey20>{message.title}: </Text>
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}
              {notification.groupedMessages.length > 3 && (
                <TouchableOpacity 
                  onPress={() => setIsGroupedMessagesExpanded(!isGroupedMessagesExpanded)}
                  marginT-s1
                  padding-s1
                  activeOpacity={0.7}
                >
                  <View row centerV spread>
                    <Text text90 color="#6366f1" style={{fontWeight: '500'}}>
                      {isGroupedMessagesExpanded 
                        ? "↑ Mostrar menos" 
                        : `↓ Ver mais ${notification.groupedMessages.length - 3} mensagens`
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View row centerV spread marginT-s3>
          <Text text90 grey40>
            {formatTime(notification.time)}
          </Text>
        </View>

        <View row centerV marginT-s2>
          <TouchableOpacity
            onPress={handleSendWebhook}
            flex
            marginR-s2
            activeOpacity={0.8}
            style={{
              backgroundColor: notification.hasSentToWebhook ? '#10b981' : '#6366f1',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text text90 white style={{fontWeight: '500'}}>
              {notification.hasSentToWebhook ? '🔄 Reenviar' : '📤 Enviar'} Webhook
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#ef4444',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 80,
            }}>
            <Text text90 white style={{fontWeight: '500'}}>
              🗑️ Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
  );
}
