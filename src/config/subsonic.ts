export interface SubsonicConfig {
  serverUrl: string;
  username: string;
  password?: string;
  token?: string;
  salt?: string;
  appName: string;
  apiVersion: string;
}

export const APP_NAME = 'CascadeMusicPlayer';
export const API_VERSION = '1.16.1';
