import React from 'react';
import {FlatList, ListRenderItem, StyleSheet} from 'react-native';
import {View, Text, TouchableOpacity} from 'react-native-ui-lib';
import {Navigation} from 'react-native-navigation';
import NotificationCard from '../components/NotificationCard';
import NotificationStats from '../components/NotificationStats';
import useNotifications from '../hooks/useNotifications.hook';
import {NotificationModel} from '../repositories/notification.repository';

// Tipos para os diferentes items da lista
type ListItemType =
  | {type: 'header'}
  | {type: 'stats'}
  | {type: 'notification'; data: NotificationModel}
  | {type: 'empty'};

interface NotificationListScreenProps {
  componentId: string;
}

export default function NotificationListScreen({componentId}: NotificationListScreenProps) {
  const {
    notifications,
    refreshing,
    refreshNotifications,
    deleteNotification,
  } = useNotifications();

  const ItemSeparator = React.useCallback(() => <View height={1} />, []);

  const openSettingsScreen = () => {
    Navigation.push(componentId, {
      component: {
        name: 'SettingsScreen',
        options: {
          topBar: {
            title: {
              text: 'Configurações',
            },
            backButton: {
              title: 'Voltar',
            },
          },
        },
      },
    });
  };

  const openFilterScreen = () => {
    Navigation.showModal({
      component: {
        name: 'FilterScreen',
        options: {
          modalPresentationStyle: 'fullScreen' as any,
        },
      },
    });
  };

  const data: ListItemType[] = React.useMemo(() => {
    const items: ListItemType[] = [];

    // Header with settings button
    items.push({type: 'header'});

    // Stats
    items.push({type: 'stats'});

    // Notifications
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        items.push({
          type: 'notification',
          data: notification,
        });
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
          <View backgroundColor="#6366f1">
            {/* Header principal */}
            <View row spread centerV paddingH-s4 paddingT-s6 paddingB-s4>
              <View flex>
                <Text text50 white>
                  Minhas Notificações
                </Text>
                <Text text80 white>
                  {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openSettingsScreen}
                paddingH-s3
                paddingV-s2
                backgroundColor="rgba(255,255,255,0.15)"
                style={{borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'}}
                activeOpacity={0.8}
              >
                <View row centerV>
                  <Text text80 white marginR-s1>⚙️</Text>
                  <Text text80 white>Configurações</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Actions bar */}
            <View row centerV paddingH-s4 paddingB-s4>
              <TouchableOpacity
                onPress={refreshNotifications}
                flex
                center
                paddingV-s3
                backgroundColor="rgba(255,255,255,0.1)"
                style={{borderRadius: 8, marginRight: 8}}
                activeOpacity={0.7}
              >
                <Text text90 white>🔄 Atualizar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={openFilterScreen}
                flex
                center
                paddingV-s3
                backgroundColor="rgba(255,255,255,0.1)"
                style={{borderRadius: 8, marginLeft: 8}}
                activeOpacity={0.7}
              >
                <Text text90 white>🔍 Filtrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'stats':
        return (
          <View backgroundColor="white" marginT-s1>
            <NotificationStats notifications={notifications} />
          </View>
        );

      case 'notification':
        return (
          <NotificationCard 
            notification={item.data} 
            onDelete={deleteNotification}
          />
        );

      case 'empty':
        return (
          <View flex center paddingH-s6 marginT-s8>
            <View center>
              {/* Ilustração vazia */}
              <View 
                center
                width={120}
                height={120}
                backgroundColor="#f1f5f9"
                marginB-s4
                style={{borderRadius: 60}}
              >
                <Text text30>📱</Text>
              </View>
              
              {/* Título */}
              <Text text60 grey10 center marginB-s2>
                Nenhuma notificação ainda
              </Text>
              
              {/* Descrição */}
              <Text text80 grey40 center marginB-s6>
                Suas notificações aparecerão aqui quando{'\n'}
                chegarem ao seu dispositivo
              </Text>
              
              {/* Dicas de uso */}
              <View backgroundColor="#f8fafc" padding-s4 style={{borderRadius: 12, width: '100%'}}>
                <Text text80 grey20 center marginB-s2>💡 Dica</Text>
                <Text text90 grey40 center>
                  Configure o webhook nas configurações para{'\n'}
                  receber notificações automaticamente
                </Text>
              </View>
              
              {/* Botão de ação */}
              <TouchableOpacity
                onPress={openSettingsScreen}
                backgroundColor="#6366f1"
                paddingH-s6
                paddingV-s3
                marginT-s4
                style={{borderRadius: 12}}
                activeOpacity={0.8}
              >
                <Text text80 white center>Configurar Webhook</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View flex backgroundColor="#f1f5f9">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if (item.type === 'notification') {
            return item.data._id || index.toString();
          }
          return `${item.type}-${index}`;
        }}
        refreshing={refreshing}
        onRefresh={refreshNotifications}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContainer}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flexGrow: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
