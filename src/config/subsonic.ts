export interface SubsonicConfig {
    serverUrl: string;
    username: string;
    password?: string;
    appName: string;
    apiVersion: string;
  }
  
export const defaultConfig: SubsonicConfig = {
    serverUrl: 'http://your-subsonic-server.com',
    username: 'your-username',
    password: 'your-password',
    appName: 'CascadeMusicPlayer',
    apiVersion: '1.16.1',
  };