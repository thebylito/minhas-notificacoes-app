import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {
  View,
  Text,
  Card,
  Button,
  LoaderScreen,
  TextField,
} from 'react-native-ui-lib';
import {Navigation} from 'react-native-navigation';
import useAppConfig from '../hooks/useAppConfig.hook';
import useNotifications from '../hooks/useNotifications.hook';

interface SettingsScreenProps {
  componentId: string;
}

export default function SettingsScreen({componentId}: SettingsScreenProps) {
  const {config, loading, updateWebhookUrl} = useAppConfig();
  const {clearNotifications} = useNotifications();
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isClearingNotifications, setIsClearingNotifications] = React.useState(false);

  React.useEffect(() => {
    if (config?.webhookUrl) {
      setWebhookUrl(config.webhookUrl);
    }
  }, [config]);

  React.useEffect(() => {
    Navigation.mergeOptions(componentId, {
      topBar: {
        title: {
          text: 'Configurações',
        },
        backButton: {
          title: 'Voltar',
        },
      },
    });
  }, [componentId]);

  const handleSaveWebhook = async () => {
    if (webhookUrl.trim()) {
      await updateWebhookUrl(webhookUrl.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setWebhookUrl(config?.webhookUrl || '');
    setIsEditing(false);
  };

  const handleClearNotifications = async () => {
    try {
      setIsClearingNotifications(true);
      await clearNotifications();
    } finally {
      setIsClearingNotifications(false);
    }
  };

  if (loading && !config) {
    return <LoaderScreen message="Carregando configurações..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View padding-s4>
        {/* Webhook Configuration */}
        <Card padding-s4 marginB-s4 enableShadow borderRadius={12}>
          <Text text60 grey10 marginB-s3>
            🔗 Webhook
          </Text>
          
          <Text text80 grey30 marginB-s3>
            Configure a URL para onde as notificações serão enviadas quando você tocar nos cards.
          </Text>

          {isEditing ? (
            <View style={{marginBottom: 16}}>
              <TextField
                value={webhookUrl}
                onChangeText={setWebhookUrl}
                placeholder="Digite a URL do webhook"
                multiline={false}
                marginB-s3
                fieldStyle={styles.textField}
              />
              <View row>
                <Button
                  label="Salvar"
                  size="small"
                  backgroundColor="#10b981"
                  borderRadius={8}
                  onPress={handleSaveWebhook}
                  loading={loading}
                  marginR-s2
                  flex
                />
                <Button
                  label="Cancelar"
                  size="small"
                  outline
                  borderRadius={8}
                  onPress={handleCancelEdit}
                  flex
                />
              </View>
            </View>
          ) : (
            <View>
              <View backgroundColor="#f8fafc" padding-s3 marginB-s3 style={{borderRadius: 8}}>
                <Text text80 grey40>
                  {config?.webhookUrl || 'Não configurado'}
                </Text>
              </View>
              <Button
                label={
                  config?.webhookUrl ? 'Editar Webhook' : 'Configurar Webhook'
                }
                size="small"
                outline
                borderRadius={8}
                onPress={() => setIsEditing(true)}
              />
            </View>
          )}
        </Card>

        {/* Apps Permitidos */}
        {config?.allowedApps && config.allowedApps.length > 0 && (
          <Card padding-s4 marginB-s4 enableShadow borderRadius={12}>
            <Text text60 grey10 marginB-s3>
              📱 Apps Permitidos
            </Text>
            <Text text80 grey30 marginB-s3>
              Apps que podem enviar notificações para este sistema.
            </Text>
            {config.allowedApps.map((app, index) => (
              <View key={index} row centerV marginB-s2>
                <Text text90 grey20 marginR-s2>•</Text>
                <Text text80 grey40>{app}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Ações */}
        <Card padding-s4 marginB-s4 enableShadow borderRadius={12}>
          <Text text60 grey10 marginB-s3>
            🗑️ Ações
          </Text>
          
          <Text text80 grey30 marginB-s3>
            Remover todas as notificações armazenadas no dispositivo.
          </Text>

          <Button
            label="Limpar Todas as Notificações"
            size="small"
            backgroundColor="#ef4444"
            borderRadius={8}
            onPress={handleClearNotifications}
            loading={isClearingNotifications}
          />
        </Card>

        {/* Informações */}
        <Card padding-s4 enableShadow borderRadius={12}>
          <Text text60 grey10 marginB-s3>
            ℹ️ Sobre
          </Text>
          
          <View marginB-s2>
            <Text text80 grey30>
              Este aplicativo coleta notificações do sistema Android e permite enviá-las para um webhook configurado.
            </Text>
          </View>
          
          <View marginB-s2>
            <Text text90 grey40>
              Versão: 1.0.0
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  textField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
});
