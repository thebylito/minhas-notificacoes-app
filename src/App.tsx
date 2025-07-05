import React from 'react';
import {FlatList, ListRenderItem, StyleSheet} from 'react-native';
import {View, Text} from 'react-native-ui-lib';
import NotificationCard from './components/NotificationCard';
import ConfigSection from './components/ConfigSection';
import NotificationStats from './components/NotificationStats';
import AppHeader from './components/AppHeader';
import useNotifications from './hooks/useNotifications.hook';
import {NotificationModel} from './repositories/notification.repository';

// Tipos para os diferentes items da lista
type ListItemType =
  | {type: 'header'}
  | {type: 'config'}
  | {type: 'stats'}
  | {type: 'notification'; data: NotificationModel}
  | {type: 'empty'};

export default function App() {
  const {
    notifications,
    loading,
    refreshing,
    refreshNotifications,
    clearNotifications,
    deleteNotification,
    sendWebhook,
  } = useNotifications();

  // Criar array de items para a FlatList
  const listData: ListItemType[] = React.useMemo(() => {
    const items: ListItemType[] = [
      {type: 'header'},
      {type: 'config'},
      {type: 'stats'},
    ];

    if (notifications.length > 0) {
      notifications.forEach(notification => {
        items.push({type: 'notification', data: notification});
      });
    } else {
      items.push({type: 'empty'});
    }

    return items;
  }, [notifications]);

  const renderItem: ListRenderItem<ListItemType> = ({item}) => {
    switch (item.type) {
      case 'header':
        return (
          <AppHeader onRefresh={refreshNotifications} refreshing={refreshing} />
        );

      case 'config':
        return (
          <ConfigSection
            onClearNotifications={clearNotifications}
            clearingNotifications={loading}
          />
        );

      case 'stats':
        return <NotificationStats notifications={notifications} />;

      case 'notification':
        return (
          <NotificationCard 
            notification={item.data} 
            onPress={sendWebhook}
            onDelete={deleteNotification}
          />
        );

      case 'empty':
        return (
          <View flex center padding-s4>
            <View marginT-s8>
              <Text text60 grey40 center marginB-s2>
                📱
              </Text>
              <Text text70 grey10 marginB-s1 center>
                Nenhuma notificação
              </Text>
              <Text text80 grey40 center>
                Suas notificações aparecerão aqui quando chegarem
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getItemKey = (item: ListItemType, index: number) => {
    if (item.type === 'notification') {
      return item.data._id || `notification-${index}`;
    }
    return `${item.type}-${index}`;
  };

  return (
    <FlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={getItemKey}
      refreshing={refreshing}
      onRefresh={refreshNotifications}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
