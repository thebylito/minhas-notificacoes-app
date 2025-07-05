

import React from 'react';
import AppConfigRepository, {IAppConfig} from '../repositories/appConfig.repository';

const appConfigRepository = new AppConfigRepository();

export default function useAppConfig() {
  const [config, setConfig] = React.useState<IAppConfig | null>(null);
  const [loading, setLoading] = React.useState(false);

  const getConfig = React.useCallback(async () => {
    try {
      setLoading(true);
      const appConfig = await appConfigRepository.getConfig();
      setConfig(appConfig);
      return appConfig;
    } catch (error) {
      console.error('Error getting config:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebhookUrl = React.useCallback(async (webhookUrl: string) => {
    try {
      setLoading(true);
      const currentConfig = await appConfigRepository.getConfig();
      currentConfig.webhookUrl = webhookUrl;
      const updatedConfig = await appConfigRepository.update(currentConfig);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error updating webhook URL:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addAllowedApp = React.useCallback(async (appName: string) => {
    try {
      setLoading(true);
      const currentConfig = await appConfigRepository.getConfig();
      if (!currentConfig.allowedApps.includes(appName)) {
        currentConfig.allowedApps.push(appName);
        const updatedConfig = await appConfigRepository.update(currentConfig);
        setConfig(updatedConfig);
        return updatedConfig;
      }
      return currentConfig;
    } catch (error) {
      console.error('Error adding allowed app:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeAllowedApp = React.useCallback(async (appName: string) => {
    try {
      setLoading(true);
      const currentConfig = await appConfigRepository.getConfig();
      currentConfig.allowedApps = currentConfig.allowedApps.filter(app => app !== appName);
      const updatedConfig = await appConfigRepository.update(currentConfig);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error removing allowed app:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    getConfig();
  }, [getConfig]);

  return {
    config,
    loading,
    getConfig,
    updateWebhookUrl,
    addAllowedApp,
    removeAllowedApp,
  };
}