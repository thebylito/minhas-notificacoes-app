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

interface NotificationCardProps {
  notification: NotificationModel;
  onPress: (notification: NotificationModel) => void;
  onDelete: (notification: NotificationModel) => void;
}

export default function NotificationCard({
  notification,
  onPress,
  onDelete,
}: NotificationCardProps) {
  const [iconPath, setIconPath] = React.useState<string | null>(null);
  const [isGroupedMessagesExpanded, setIsGroupedMessagesExpanded] = React.useState(false);
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
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(notification)}>
      <Card
        padding-s4
        marginV-s2
        marginH-s3
        enableShadow
        borderRadius={6}
        backgroundColor={notification.hasSentToWebhook ? '#f0f9f0' : '#ffffff'}>
        <View row spread centerV marginB-s2>
          <View row centerV>
            {iconPath && (
              <View
                backgroundColor="#6366f1"
                center
                marginR-s1
                padding-s1
                style={{borderRadius: 6}}>
                <Image
                  width={20}
                  height={20}
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
            {notification.hasSentToWebhook && (
              <Badge
                label="Enviado"
                size={16}
                backgroundColor="#10b981"
                marginL-s2
              />
            )}
          </View>
          <View row centerV>
            <Text text90 grey40 marginR-s2>
              {formatTime(notification.time)}
            </Text>
            <TouchableOpacity
              onPress={handleDelete}
              padding-s1
              style={{
                backgroundColor: '#ef4444',
                borderRadius: 6,
                minWidth: 24,
                minHeight: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text text100 white>
                X
              </Text>
            </TouchableOpacity>
          </View>
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

        <View row centerV marginT-s2>
          <View flex>
            <Text text100 grey40>
              Toque para {notification.hasSentToWebhook ? 'reenviar' : 'enviar'}{' '}
              webhook
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
