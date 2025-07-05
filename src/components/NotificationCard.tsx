import React from 'react';
import {
  View,
  Text,
  Card,
  Badge,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native-ui-lib';
import {
  NotificationModel,
  NotificationRepository,
} from '../repositories/notification.repository';
import { WebhookService } from '../services/webhook.service';
import useAppConfig from '../hooks/useAppConfig.hook';
import ZoomableImage from './ZoomableImage';

interface NotificationCardProps {
  notification: NotificationModel;
  onDelete: (notification: NotificationModel) => void;
}

export default function NotificationCard({
  notification,
  onDelete,
}: NotificationCardProps) {
  const [iconPath, setIconPath] = React.useState<string | null>(null);
  const [imagePath, setImagePath] = React.useState<string | null>(null);
  const [isGroupedMessagesExpanded, setIsGroupedMessagesExpanded] = React.useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = React.useState(false);
  const { config } = useAppConfig();
  const notificationRepository = React.useMemo(
    () => new NotificationRepository(),
    [],
  );

  // Load icon path when component mounts or notification changes
  React.useEffect(() => {
    const loadIcons = async () => {
      if (notification._id) {
        // Load regular icon
        const path = await notificationRepository.getIconPath(notification._id);
        setIconPath(path);

        // Load image
        const imageFilePath = await notificationRepository.getImagePath(notification._id);
        setImagePath(imageFilePath);
      }
    };
    loadIcons();
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
    <>
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
                  br10>
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

          <View row centerV spread marginB-s1>
            <Text text70 grey10 numberOfLines={2} flex>
              {notification.title}
            </Text>
            {imagePath && (
              <TouchableOpacity 
                onPress={() => setIsImageModalVisible(true)}
                marginL-s1
                activeOpacity={0.7}
                padding-s1
              >
                <Text text80 color="#6366f1">🔍</Text>
              </TouchableOpacity>
            )}
          </View>

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
                  br20
                >
                  <Text text100 white>
                    {notification.groupedMessages.length}
                  </Text>
                </View>
              </View>
              <View backgroundColor="#f8fafc" padding-s2 br10>
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
                      <Text text90 color="#6366f1">
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
              backgroundColor={notification.hasSentToWebhook ? '#10b981' : '#6366f1'}
              br20
              padding-15
              center>
              <Text text90 white>
                {notification.hasSentToWebhook ? '🔄 Reenviar' : '📤 Enviar'} Webhook
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.8}
              backgroundColor="#ef4444"
              br20
              padding-15
              center>
              <Text text90 white>
                🗑️ Excluir
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Modal para visualizar imagem grande */}
        {imagePath && (
          <Modal 
            visible={isImageModalVisible}
            onBackgroundPress={() => setIsImageModalVisible(false)}
            overlayBackgroundColor="rgba(0,0,0,0.9)"
          >
            <View style={{ flex: 1, position: 'relative' }}>
              <TouchableOpacity 
                onPress={() => setIsImageModalVisible(false)}
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 20,
                  zIndex: 1000,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 20,
                  padding: 10,
                }}
              >
                <Text text60>✕</Text>
              </TouchableOpacity>
              
              <ZoomableImage
                source={{ uri: imagePath }}
                maxZoom={5}
                minZoom={0.5}
              />
              
              <View style={{
                position: 'absolute',
                bottom: 40,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 10,
                padding: 15,
              }}>
                <Text text80 white center>
                  {notification.title}
                </Text>
              </View>
            </View>
          </Modal>
        )}
    </>
  );
}
