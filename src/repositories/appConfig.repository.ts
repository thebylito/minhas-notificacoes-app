import { BaseRepository } from '../repository/baseRepository';

export interface IAppConfig {
  _id?: string;
  allowedApps: string[]
  webhookUrl: string | null;
}

class AppConfigModel implements IAppConfig {
  public _id!: string; // Optional ID for internal use
  public allowedApps!: string[];
  public webhookUrl!: string | null;

  constructor(config: NonNullable<IAppConfig>) {
    Object.assign(this, config);
  }

  public isAppAllowed(appName: string): boolean {
    if (!appName) {
      console.warn('App name is empty, defaulting to reject');
      return false;
    }
    if (this.allowedApps.length === 0) {
      return true; // If no apps are configured, allow all by default
    }
    return this.allowedApps.some(
      allowedApp => allowedApp.toLowerCase() === appName.toLowerCase(),
    );
  }

  public addAllowedApp(appName: string): void {
    this.allowedApps = this.allowedApps.filter(
      allowedApp => allowedApp.toLowerCase() !== appName.toLowerCase(),
    );
  }
}

export default class AppConfigRepository extends BaseRepository<AppConfigModel> {
  constructor() {
    super(AppConfigModel, 'appConfig');
  }

  public async getConfig(): Promise<AppConfigModel> {
    const config = await this.findOne();
    if (!config) {
      const newConfig = new AppConfigModel({
        allowedApps: [],
        webhookUrl: null,
      });
      const created = await this.create(newConfig);
      if (!created) {
        throw new Error('Failed to create initial app config');
      }
      return created;
    }
    return config;
  }
}
