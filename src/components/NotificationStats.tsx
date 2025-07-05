import React from 'react';
import {View, Text} from 'react-native-ui-lib';
import {NotificationModel} from '../repositories/notification.repository';

interface NotificationStatsProps {
  notifications: NotificationModel[];
}

export default function NotificationStats({notifications}: NotificationStatsProps) {
  const totalNotifications = notifications.length;
  const sentNotifications = notifications.filter(n => n.hasSentToWebhook).length;
  const pendingNotifications = totalNotifications - sentNotifications;
  
  const uniqueApps = [...new Set(notifications.map(n => n.app))];
  
  const getAppCount = (appName: string) => 
    notifications.filter(n => n.app === appName).length;

  if (totalNotifications === 0) {
    return null;
  }

  return (
    <View paddingH-s4 paddingV-s4>
      <Text text70 grey10 marginB-s3>
        📊 Estatísticas
      </Text>
      
      {/* Cards de estatísticas principais */}
      <View row marginB-s4>
        <View 
          flex-1 
          center 
          paddingV-s4 
          backgroundColor="#6366f1" 
          marginR-s2
          style={{borderRadius: 12}}
        >
          <Text text50 white marginB-s1>
            {totalNotifications}
          </Text>
          <Text text90 white>
            Total
          </Text>
        </View>
        
        <View 
          flex-1 
          center 
          paddingV-s4 
          backgroundColor="#10b981" 
          marginH-s1
          style={{borderRadius: 12}}
        >
          <Text text50 white marginB-s1>
            {sentNotifications}
          </Text>
          <Text text90 white>
            Enviadas
          </Text>
        </View>
        
        <View 
          flex-1 
          center 
          paddingV-s4 
          backgroundColor="#f59e0b" 
          marginL-s2
          style={{borderRadius: 12}}
        >
          <Text text50 white marginB-s1>
            {pendingNotifications}
          </Text>
          <Text text90 white>
            Pendentes
          </Text>
        </View>
      </View>

      {/* Apps mais ativos */}
      {uniqueApps.length > 0 && (
        <View 
          backgroundColor="white" 
          padding-s4 
          style={{borderRadius: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2}}
        >
          <Text text80 grey10 marginB-s3>
            📱 Por App
          </Text>
          <View>
            {uniqueApps.slice(0, 4).map((app, index) => (
              <View key={index} row spread centerV marginB-s2>
                <Text text90 grey10 flex numberOfLines={1}>
                  {app}
                </Text>
                <View 
                  backgroundColor="#f1f5f9" 
                  paddingH-s2 
                  paddingV-1
                  style={{borderRadius: 8}}
                >
                  <Text text90 grey30>
                    {getAppCount(app)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          {uniqueApps.length > 4 && (
            <View marginT-s2 paddingT-s2 style={{borderTopWidth: 1, borderTopColor: '#f1f5f9'}}>
              <Text text90 grey40 center>
                +{uniqueApps.length - 4} outros apps
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
