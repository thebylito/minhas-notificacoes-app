import React from 'react';
import {StyleSheet} from 'react-native';
import {
  View,
  Text,
  Card,
  Button,
  LoaderScreen,
  TextField,
} from 'react-native-ui-lib';
import useAppConfig from '../hooks/useAppConfig.hook';

interface ConfigSectionProps {
  onClearNotifications: () => void;
  clearingNotifications?: boolean;
}

export default function ConfigSection({
  onClearNotifications,
  clearingNotifications = false,
}: ConfigSectionProps) {
  const {config, loading, updateWebhookUrl} = useAppConfig();
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (config?.webhookUrl) {
      setWebhookUrl(config.webhookUrl);
    }
  }, [config]);

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

  if (loading && !config) {
    return <LoaderScreen message="Carregando configurações..." />;
  }

  return (
    <View>
      <Text text60 grey20 marginB-s3 marginH-s4>
        Configurações
      </Text>

      <Card padding-s4 marginH-s4 marginB-s4 enableShadow borderRadius={12}>
        <Text text70 grey10 marginB-s2>
          Webhook URL
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
            <Text text80 grey40 marginB-s3>
              {config?.webhookUrl || 'Não configurado'}
            </Text>
            <Button
              label={
                config?.webhookUrl ? 'Editar Webhook' : 'Configurar Webhook'
              }
              size="small"
              outline
              borderRadius={8}
              onPress={() => setIsEditing(true)}
              marginB-s3
            />
          </View>
        )}

        <Button
          label="Limpar Notificações"
          size="small"
          backgroundColor="#ef4444"
          borderRadius={8}
          onPress={onClearNotifications}
          loading={clearingNotifications}
        />
      </Card>

      {config?.allowedApps && config.allowedApps.length > 0 && (
        <Card padding-s4 marginH-s4 marginB-s4 enableShadow borderRadius={12}>
          <Text text70 grey10 marginB-s2>
            Apps Permitidos
          </Text>
          {config.allowedApps.map((app, index) => (
            <Text key={index} text80 grey40 marginB-s1>
              • {app}
            </Text>
          ))}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
});
