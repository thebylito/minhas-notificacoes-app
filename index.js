/**
 * @format
 */

import NotificationListScreen from './src/screens/NotificationListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {Navigation} from 'react-native-navigation';
import {startHeadlessNotificationListener} from './src/headless/notificationListener';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';

// Register screens
Navigation.registerComponent('NotificationListScreen', () => NotificationListScreen);
Navigation.registerComponent('SettingsScreen', () => SettingsScreen);

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        options: {
          topBar: {
            visible: false,
          },
        },
        children: [
          {
            component: {
              name: 'NotificationListScreen',
            },
          },
        ],
      },
    },
  });
});

// To check if the user has permission
RNAndroidNotificationListener.getPermissionStatus()
  .then(status => {
    // Handle the status here
    console.log('Notification permission status:', status);
    if (status === 'denied') {
      RNAndroidNotificationListener.requestPermission();
      console.warn(
        'Notification permission denied. Please enable it in settings.',
      );
      return;
    }
    if (status === 'unknown') {
      RNAndroidNotificationListener.requestPermission();
      console.warn(
        'Notification permission status is unknown. Please check your settings.',
      );
      return;
    }
    if (status === 'authorized') {
      startHeadlessNotificationListener();
    }
  })
  .catch(error => {
    // Handle the error here
    console.error('Error getting notification permission status:', error);
  });
//console.log(status); // Result can be 'authorized', 'denied' or 'unknown'
