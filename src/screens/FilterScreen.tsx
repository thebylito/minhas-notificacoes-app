import React from 'react';
import {
  View,
  Text,
  Card,
  TouchableOpacity,
  Switch,
  TextField,
  Button,
} from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import useNotifications from '../hooks/useNotifications.hook';
import useAppConfig from '../hooks/useAppConfig.hook';

interface FilterScreenProps {
  componentId: string;
}

export default function FilterScreen({ componentId }: FilterScreenProps) {
  const { notifications } = useNotifications();
  const { config, addAllowedApp, removeAllowedApp } = useAppConfig();
  const [searchText, setSearchText] = React.useState('');
  const [filteredApps, setFilteredApps] = React.useState<string[]>([]);

  // Get unique app names from notifications
  const allApps = React.useMemo(() => {
    const uniqueApps = [...new Set(notifications.map(n => n.app))];
    return uniqueApps.sort();
  }, [notifications]);

  // Filter apps based on search text
  React.useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredApps(allApps);
    } else {
      const filtered = allApps.filter(app => 
        app.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredApps(filtered);
    }
  }, [searchText, allApps]);

  const isAppAllowed = (appName: string) => {
    return config?.allowedApps.includes(appName) || false;
  };

  const toggleAppFilter = async (appName: string) => {
    if (isAppAllowed(appName)) {
      // Remove from allowed apps
      await removeAllowedApp(appName);
    } else {
      // Add to allowed apps
      await addAllowedApp(appName);
    }
  };

  const getAppNotificationCount = (appName: string) => {
    return notifications.filter(n => n.app === appName).length;
  };

  const closeScreen = () => {
    Navigation.dismissModal(componentId);
  };

  return (
    <View flex backgroundColor="#f8fafc">
      {/* Header */}
      <View 
        backgroundColor="#6366f1" 
        paddingH-s4 
        paddingT-s6 
        paddingB-s4
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View row centerV spread marginB-s3>
          <Text text60 white style={{fontWeight: 'bold'}}>
            🔍 Filtrar Apps
          </Text>
          <TouchableOpacity
            onPress={closeScreen}
            backgroundColor="rgba(255,255,255,0.2)"
            paddingH-s3
            paddingV-s2
            style={{borderRadius: 8}}
          >
            <Text text80 white>Fechar</Text>
          </TouchableOpacity>
        </View>
        
        <TextField
          placeholder="Buscar aplicativo..."
          value={searchText}
          onChangeText={setSearchText}
          containerStyle={{
            backgroundColor: 'white',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
          style={{
            fontSize: 16,
            color: '#1f2937',
          }}
        />
      </View>

      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View paddingH-s4 paddingV-s4>
          {/* Instructions */}
          <Card 
            backgroundColor="#e0f2fe" 
            padding-s4 
            marginB-s4
            style={{borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0ea5e9'}}
          >
            <Text text80 color="#0369a1" marginB-s1 style={{fontWeight: '600'}}>
              💡 Como funciona
            </Text>
            <Text text90 color="#0c4a6e">
              Ative os aplicativos que você deseja monitorar. Apenas notificações dos apps selecionados serão processadas e enviadas via webhook.
            </Text>
          </Card>

          {/* Stats */}
          <View row spread marginB-s4>
            <Card 
              flex-1 
              center 
              paddingV-s3 
              backgroundColor="white" 
              marginR-s2
              style={{borderRadius: 10}}
            >
              <Text text60 color="#6366f1" style={{fontWeight: 'bold'}}>
                {allApps.length}
              </Text>
              <Text text90 grey40>Total de Apps</Text>
            </Card>
            
            <Card 
              flex-1 
              center 
              paddingV-s3 
              backgroundColor="white" 
              marginL-s2
              style={{borderRadius: 10}}
            >
              <Text text60 color="#10b981" style={{fontWeight: 'bold'}}>
                {config?.allowedApps.length || 0}
              </Text>
              <Text text90 grey40>Apps Ativos</Text>
            </Card>
          </View>

          {/* App List */}
          {filteredApps.length > 0 ? (
            <View>
              <Text text70 grey10 marginB-s3 style={{fontWeight: '600'}}>
                📱 Aplicativos ({filteredApps.length})
              </Text>
              
              {filteredApps.map((appName, index) => (
                <Card 
                  key={index}
                  backgroundColor="white"
                  padding-s4
                  marginB-s3
                  style={{borderRadius: 12}}
                >
                  <View row centerV spread>
                    <View flex>
                      <Text text80 grey10 marginB-s1 numberOfLines={2}>
                        {appName}
                      </Text>
                      <Text text90 grey40>
                        {getAppNotificationCount(appName)} notificações
                      </Text>
                    </View>
                    
                    <Switch
                      value={isAppAllowed(appName)}
                      onValueChange={() => toggleAppFilter(appName)}
                      onColor="#10b981"
                      offColor="#e5e7eb"
                      thumbColor="white"
                    />
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card 
              center 
              paddingV-s6 
              backgroundColor="white"
              style={{borderRadius: 12}}
            >
              <Text text70 grey40 marginB-s2>
                🔍 Nenhum app encontrado
              </Text>
              <Text text90 grey50 center>
                Tente ajustar o termo de busca
              </Text>
            </Card>
          )}

          {/* Actions */}
          <View marginT-s4>
            <Button
              label="✅ Selecionar Todos"
              backgroundColor="#10b981"
              marginB-s3
              borderRadius={10}
              onPress={async () => {
                for (const appName of filteredApps) {
                  if (!isAppAllowed(appName)) {
                    await addAllowedApp(appName);
                  }
                }
              }}
            />
            
            <Button
              label="❌ Desmarcar Todos"
              backgroundColor="#ef4444"
              borderRadius={10}
              onPress={async () => {
                for (const appName of filteredApps) {
                  if (isAppAllowed(appName)) {
                    await removeAllowedApp(appName);
                  }
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
