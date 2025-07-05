/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

import { Navigation } from 'react-native-navigation';
import { startHeadlessNotificationListener } from './src/headless/notificationListener';

Navigation.registerComponent('com.myApp.WelcomeScreen', () => App);

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
              name: 'com.myApp.WelcomeScreen',
            },
          },
        ],
      },
    },
  });
});

// import RNAndroidNotificationListener, {
//   RNAndroidNotificationListenerHeadlessJsName,
// } from 'react-native-android-notification-listener';
// import { startHeadlessNotificationListener } from './src/headless/notificationListener';

// // To check if the user has permission
// RNAndroidNotificationListener.getPermissionStatus()
//   .then(status => {
//     // Handle the status here
//     console.log('Notification permission status:', status);
//   })
//   .catch(error => {
//     // Handle the error here
//     console.error('Error getting notification permission status:', error);
//   });
// //console.log(status); // Result can be 'authorized', 'denied' or 'unknown'

startHeadlessNotificationListener();
// console.log('Headless notification listener started');
