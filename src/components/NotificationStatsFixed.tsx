import React from 'react';
import {View, Text, Card} from 'react-native-ui-lib';
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
    <View marginH-s4 marginB-s4>
      <Text text70 grey10 marginB-s2>
        Estatísticas
      </Text>
      
      <View row>
        <Card flex-1 padding-s3 marginR-s2 enableShadow borderRadius={8}>
          <Text text60 primaryColor center>
            {totalNotifications}
          </Text>
          <Text text90 grey40 center>
            Total
          </Text>
        </Card>
        
        <Card flex-1 padding-s3 marginH-s1 enableShadow borderRadius={8}>
          <Text text60 green30 center>
            {sentNotifications}
          </Text>
          <Text text90 grey40 center>
            Enviadas
          </Text>
        </Card>
        
        <Card flex-1 padding-s3 marginL-s2 enableShadow borderRadius={8}>
          <Text text60 orange30 center>
            {pendingNotifications}
          </Text>
          <Text text90 grey40 center>
            Pendentes
          </Text>
        </Card>
      </View>

      {uniqueApps.length > 0 && (
        <Card padding-s3 marginT-s3 enableShadow borderRadius={8}>
          <Text text80 grey10 marginB-s2>
            Por App:
          </Text>
          <View row>
            {uniqueApps.slice(0, 3).map((app, index) => (
              <View key={index} flex marginR-s2>
                <Text text90 grey40>
                  {app}: {getAppCount(app)}
                </Text>
              </View>
            ))}
          </View>
          {uniqueApps.length > 3 && (
            <View marginT-s1>
              <Text text90 grey40>
                +{uniqueApps.length - 3} outros apps
              </Text>
            </View>
          )}
        </Card>
      )}
    </View>
  );
}
